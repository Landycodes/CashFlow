const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const { Types } = require("mongoose");
const dayjs = require("dayjs");

const formatters = {
  list: (transactions) => {
    return transactions.map((tx) => ({
      ...tx.toObject(),
      date: dayjs(tx.date).format("MM/DD/YYYY"),
    }));
  },
  totals: (transactions, { days }) => {
    days = days * 1000 * 60 * 60 * 24;
    const currentDate = new Date().getTime();

    const income = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          currentDate - new Date(t.date).getTime() <= days
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);

    const expense = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          currentDate - new Date(t.date).getTime() <= days
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);

    return { income, expense };
  },
};

const getTransactions = async (user = null, type = "list", options = {}) => {
  if (!user) return null;

  const foundUser = await User.findById(user._id).lean();
  const { selected_account_id } = foundUser;

  if (!selected_account_id) {
    console.error({ getTransactions: "No selected account id found" });
    return [];
  }

  if (type === "group") {
    const { days } = options;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const groupedTx = await Transaction.aggregate([
      {
        $match: {
          user_id: new Types.ObjectId(user._id),
          account_id: selected_account_id,
          date: { $gte: cutoff },
          type: "expense",
        },
      },
      {
        $group: {
          _id: { name: "$name", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])
      .sort({ total: -1 })
      .limit(10);

    return groupedTx;
  }

  const transactions = await Transaction.find({
    user_id: user._id,
    account_id: selected_account_id,
  });

  const format = formatters[type];
  return format ? format(transactions, options) : transactions;
};

module.exports = { getTransactions };
