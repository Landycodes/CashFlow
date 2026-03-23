const Transaction = require("../../models/Transactions");
const User = require("../../models/Users");
const { Op } = require("sequelize");
const { sequelize } = require("../../config/connection");
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
          currentDate - new Date(t.date).getTime() <= days,
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);

    const expense = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          currentDate - new Date(t.date).getTime() <= days,
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);

    return { income, expense };
  },
};

const getTransactions = async (user = null, type = "list", options = {}) => {
  if (!user) return null;

  const foundUser = await User.findByPk(user.id, { raw: true });
  // console.log(foundUser);
  const { selected_account_id } = foundUser;

  if (!selected_account_id) {
    console.error({ getTransactions: "No selected account id found" });
    return [];
  }

  if (type === "group") {
    const { days } = options;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const groupedTx = await Transaction.findAll({
      where: {
        user_id: user.id,
        account_id: selected_account_id,
        date: { [Op.gte]: cutoff },
        type: "EXPENSE",
      },
      attributes: [
        "name",
        "type",
        [sequelize.fn("SUM", sequelize.col("amount")), "total"],
        // [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["name", "type"],
      order: [[sequelize.literal("total"), "DESC"]],
      limit: 10,
      raw: true,
    });

    return groupedTx;
  }

  const transactions = await Transaction.findAll({
    where: {
      user_id: user.id,
      account_id: selected_account_id,
    },
  });

  const format = formatters[type];
  return format ? format(transactions, options) : transactions;
};

module.exports = { getTransactions };
