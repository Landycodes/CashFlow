const Transaction = require("../models/Transaction");
const { Types } = require("mongoose");
const { getTransactions } = require("./services/transactionServices");

module.exports = {
  async getTransactionTotals({ user = null, body }, res) {
    try {
      const { days } = body;
      const transactions = await getTransactions(user, "totals", { days });

      if (transactions.length <= 0) {
        res
          .status(404)
          .json({ getTransactionTotals: "Unable to find transactions" });
      }

      return res.json(transactions);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ getTransactionTotals: "Failed to retrieve transactions" });
    }
  },
  async deleteUserTransactions({ user = null }, res) {
    if (!user)
      res.status(404).json({ deleteUserTransactions: "Unable to find user" });

    try {
      const deletedTransactions = await Transaction.deleteMany({
        user_id: user._id,
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
  async getTransactionList({ user = null }, res) {
    try {
      const transactions = await getTransactions(user, "list");

      if (transactions.length <= 0) {
        res.status(404).json({ getTransactionList: "No transactions found" });
      }

      res.json(transactions);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ getTransactionList: "Failed to get transactions" });
    }
  },
  async getTransactionGroups({ user = null, body }, res) {
    try {
      const { days } = body;
      const transactions = await getTransactions(user, "group", { days });

      if (transactions.length <= 0) {
        return res
          .status(404)
          .json({ getTransactionGroups: "No transactions found" });
      }

      res.json(transactions);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ getTransactionGroups: "Failed to get transaction groups" });
    }
  },

  // async getTransactionGroups({ params, body }, res) {
  //   const { user_id, account_id } = params;
  //   const { days } = body;

  //   const cutoff = new Date();
  //   cutoff.setDate(cutoff.getDate() - days);
  //   try {
  //     const txResponse = await Transaction.aggregate([
  //       {
  //         $match: {
  //           user_id: new Types.ObjectId(user_id),
  //           account_id: account_id,
  //           date: { $gte: cutoff },
  //           type: "expense",
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: { name: "$name", type: "$type" },
  //           total: { $sum: "$amount" },
  //           count: { $sum: 1 },
  //         },
  //       },
  //     ])
  //       .sort({ total: -1 })
  //       .limit(10);

  //     res.json(txResponse);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500);
  //   }
  // },

  //delete income by id
  //delete expense by id
  //get income in the last x amount of days
  //get expense in the last x amount of days
  //get income between x and y dates
  //get expenses between x and y dates
  //update income by id
  //update expense by id
};
