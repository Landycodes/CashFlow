const { Users, Transactions, Recurring, sequelize } = require("../models");
const { getSelectedAccountId } = require("../controller/services/userService");
const { Op } = require("sequelize");

module.exports = {
  async getAllRecurring({ user = null, body }, res) {
    if (!user)
      res.status(404).json({ getAllRecurring: "Token user not found" });

    const selected_account_id = await getSelectedAccountId(user.id);
    const { type = "BILL", limit = null } = body;

    try {
      const recurring = await Recurring.findAll({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          type: type,
        },
        attributes: [
          "name",
          "amount",
          "frequency",
          "id",
          [
            sequelize.fn("TO_CHAR", sequelize.col("last_paid"), "MM/DD/YYYY"),
            "last_paid",
          ],
          [
            sequelize.fn(
              "TO_CHAR",
              sequelize.col("predicted_next_date"),
              "MM/DD/YYYY",
            ),
            "next_due",
          ],
          [
            sequelize.literal(
              `ROUND(EXTRACT(EPOCH FROM (predicted_next_date - NOW())) / 86400)`,
            ),
            "days_away",
          ],
        ],
        order: [[sequelize.col("predicted_next_date"), "ASC"]],
        limit: limit,
        raw: true,
      });

      if (recurring.length <= 0) res.status(200).end();

      res.status(200).json(recurring);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  async getNextRecurring({ user = null }, res) {
    if (!user)
      res.status(404).json({ getNextRecurring: "User Token Not Found" });

    try {
      const selected_account_id = await getSelectedAccountId(user.id);

      const nextPayment = await Recurring.findOne({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          type: "PAYMENT",
          // predicted_next_date: {
          //   [Op.gte]: new Date(),
          // }, // REMOVE COMMENTS WHEN TESTING LIVE DATA
        },
        order: [["predicted_next_date", "ASC"]],
        raw: true,
      });

      if (!nextPayment) res.status(200).end();

      const { predicted_next_date } = nextPayment;
      const nextPaymentAmount = parseFloat(nextPayment.amount);

      let nextBillsDue = await Recurring.sum("amount", {
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          type: "BILL",
          predicted_next_date: {
            [Op.lte]: predicted_next_date,
          },
        },
        raw: true,
      });

      if (!nextBillsDue) nextBillsDue = 0;

      res
        .status(200)
        .json({ nextPayment: nextPaymentAmount, nextBillsDue: nextBillsDue });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
};
