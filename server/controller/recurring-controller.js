const { Users, Transactions } = require("../models");
const dayjs = require("dayjs");

module.exports = {
  async getRecurringBills({ user = null }, res) {
    if (!user)
      res.status(404).json({ getRecurringBills: "Token user not found" });

    const account = await Users.findByPk(user.id, { raw: true });
    const { selected_account_id } = account;

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
};
