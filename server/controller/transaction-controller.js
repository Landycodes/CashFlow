const { Op } = require("sequelize");
const { Users, Transactions, sequelize } = require("../models");
const { getSelectedAccountId } = require("../controller/services/userService");

const getCutOff = (days) => {
  const today = new Date();
  return today.setDate(today.getDate() - days);
};

// const getSelectedAccountId = async (userId) => {
//   const account = await Users.findByPk(userId, {
//     attributes: ["selected_account_id"],
//     raw: true,
//   });
//   if (!account) throw new Error("Failed to get user account Id");

//   return account.selected_account_id;
// };

module.exports = {
  async getTransactionTotals({ user = null, body }, res) {
    if (!user)
      return res.status(400).json({ getTransactionTotals: "Missing user Id" });
    const { days } = body;

    try {
      const cutoff = getCutOff(days);
      const accountId = await getSelectedAccountId(user.id);

      let transactions = await Transactions.findAll({
        where: {
          user_id: user.id,
          account_id: accountId,
          date: { [Op.between]: [cutoff, new Date()] },
        },
        attributes: [
          [sequelize.fn("SUM", sequelize.col("amount")), "total"],
          "type",
        ],
        group: ["type"],
        raw: true,
      });

      transactions = transactions.reduce((acc, item) => {
        acc[item.type.toLowerCase()] = item.total;
        return acc;
      }, {});

      if (!transactions) {
        res
          .status(404)
          .json({ getTransactionTotals: "Unable to get transactions" });
      }

      return res.json(transactions);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ getTransactionTotals: "Failed to retrieve transactions" });
    }
  },
  async getTransactionList({ user = null }, res) {
    if (!user)
      return res.status(400).json({ getTransactionTotals: "Missing user Id" });
    try {
      const accountId = await getSelectedAccountId(user.id);

      const transactions = await Transactions.findAll({
        where: {
          user_id: user.id,
          account_id: accountId,
        },
        attributes: [
          "transaction_id",
          [
            sequelize.fn("TO_CHAR", sequelize.col("date"), "MM/DD/YYYY"),
            "date",
          ],
          "amount",
          "name",
          "type",
          "category",
        ],
        raw: true,
      });
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
    if (!user)
      return res.status(400).json({ getTransactionGroups: "Missing user Id" });

    const { days, limit = null, type = "EXPENSE" } = body;
    try {
      const cutoff = getCutOff(days);
      const accountId = await getSelectedAccountId(user.id);

      const transactions = await Transactions.findAll({
        where: {
          user_id: user.id,
          account_id: accountId,
          date: { [Op.between]: [cutoff, new Date()] },
          type: type,
        },
        attributes: [
          "name",
          [sequelize.fn("SUM", sequelize.col("amount")), "total"],
          "type",
        ],
        group: ["name", "type"],
        order: [[sequelize.fn("SUM", sequelize.col("amount")), "DESC"]],
        limit: limit,
        raw: true,
      });

      // console.log(transactions);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ getTransactionGroups: "Failed to get transaction groups" });
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
