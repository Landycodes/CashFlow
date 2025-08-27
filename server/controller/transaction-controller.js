const Transaction = require("../models/Transaction");
const { Types } = require("mongoose");
const dayjs = require("dayjs");

module.exports = {
  async getTransactionTotals({ params, body }, res) {
    const { user_id, account_id } = params;
    let { days } = body;

    // Convert to milliseconds
    days = days * 1000 * 60 * 60 * 24;

    try {
      const transactions = await Transaction.find({
        user_id: new Types.ObjectId(user_id),
        account_id: account_id,
      }); /* .select("amount type date name") */

      if (transactions.length === 0) {
        res.status(404).json("Unable to get transactions");
      }

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

      return res.json({ income, expense });
    } catch (err) {
      console.error(err);
      return res.status(400).json(err);
    }
  },
  async deleteUserTransactions({ params }, res) {
    const { user_id } = params;

    try {
      const deletedTransactions = await Transaction.deleteMany({
        user_id: user_id,
      });

      if (!deletedTransactions) {
        res
          .status(404)
          .json("Did not find any transactions associated with user");
      }

      res.json(deletedTransactions);
    } catch (error) {
      console.error("Failed to delete transactions", error);
      res.status(500);
    }
  },
  async getTransactionList({ params }, res) {
    const { user_id, account_id } = params;

    try {
      const transactions = await Transaction.find({
        user_id: new Types.ObjectId(user_id),
        account_id: account_id,
      });

      const txResponse = transactions.map((tx) => ({
        ...tx.toObject(),
        date: dayjs(tx.date).format("MM/DD/YYYY"),
      }));

      res.json(txResponse);
    } catch (error) {
      console.error(error);
      res.status(500);
    }
  },

  //delete income by id
  //delete expense by id
  //get income in the last x amount of days
  //get expense in the last x amount of days
  //get income between x and y dates
  //get expenses between x and y dates
  //update income by id
  //update expense by id
};
