const Transaction = require("../models/Transaction");
const { Types } = require("mongoose");

module.exports = {
  async getTransactions({ params }, res) {
    const { user_id, account_id } = params;

    try {
      const transactions = await Transaction.find({
        user_id: new Types.ObjectId(user_id),
        account_id: account_id,
      }).select("amount type date name");

      if (!transactions) {
        res.statu(404).json("Unable to get transactions");
      }
      const income = transactions.filter((t) => t.type === "income");
      const expense = transactions.filter((t) => t.type === "expense");

      return res.json({ income, expense });
    } catch (err) {
      console.error(err);
      return res.status(400).json(err);
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
