const { Users, Transactions, Recurring } = require("../models");
const { getSelectedAccountId } = require("../controller/services/userService");
const dayjs = require("dayjs");
const { Op } = require("sequelize");

module.exports = {
  async getRecurringBills({ user = null }, res) {
    if (!user)
      res.status(404).json({ getRecurringBills: "Token user not found" });

    const selected_account_id = await getSelectedAccountId(user.id);

    try {
      const recurringBills = await Recurring.findAll({
        where: {
          user_id: user.id,
          charged_to: selected_account_id,
          type: "BILL",
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
        ],
        raw: true,
      });

      if (recurringBills.length <= 0) return;

      res.json(recurringBills);
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

      // find all bills due before next payment date and get the sum of amounts

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
