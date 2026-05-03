const { Users, Transactions, Recurring, sequelize } = require("../models");
const { getSelectedAccountId } = require("../controller/services/userService");
const { Op } = require("sequelize");

module.exports = {
  async getAllRecurring({ user = null, body }, res) {
    if (!user)
      return res.status(404).json({ getAllRecurring: "Token user not found" });

    const selected_account_id = await getSelectedAccountId(user.id);
    const { type = null, limit = null } = body;

    try {
      const recurring = await Recurring.findAll({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          ...(type && { type }),
        },
        attributes: [
          "name",
          "amount",
          "frequency",
          "type",
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

      if (recurring.length <= 0) return res.status(200).end();

      res.status(200).json(recurring);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  async getNextRecurring({ user = null }, res) {
    if (!user)
      return res.status(404).json({ getNextRecurring: "User Token Not Found" });

    try {
      const selected_account_id = await getSelectedAccountId(user.id);

      const nextPayment = await Recurring.findOne({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          type: "PAYMENT",
          predicted_next_date: {
            [Op.gte]: new Date(),
          }, // REMOVE COMMENTS WHEN TESTING LIVE DATA
        },
        attributes: [
          "amount",
          "predicted_next_date",
          [
            sequelize.fn(
              "TO_CHAR",
              sequelize.col("predicted_next_date"),
              "Mon DDth",
            ),
            "formatted_date",
          ],
        ],
        order: [["predicted_next_date", "ASC"]],
        raw: true,
      });

      if (!nextPayment)
        return res
          .status(200)
          .json({ getNextRecurring: "No upcoming payments found" });

      const { predicted_next_date } = nextPayment;
      const nextPaymentAmount = parseFloat(nextPayment.amount);

      const nextBillsDue = await Recurring.findAll({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
          type: "BILL",
          predicted_next_date: {
            [Op.lte]: predicted_next_date,
          },
        },
        attributes: [
          "name",
          "amount",
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

      const billTotal = nextBillsDue.reduce(
        (acc, cur) => acc + parseFloat(cur.amount),
        0,
      );

      res.status(200).json({
        nextPayment: {
          amount: nextPaymentAmount,
          date: nextPayment?.formatted_date,
        },
        nextBillsDue: { total: billTotal, bills: nextBillsDue },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  async getRecurringCalEvents({ user = null }, res) {
    if (!user)
      return res.status(404).json({ getNextRecurring: "User Token Not Found" });

    try {
      const selected_account_id = await getSelectedAccountId(user.id);

      const upcomingCalEvents = await Recurring.findAll({
        where: {
          user_id: user.id,
          account_id: selected_account_id,
        },
        attributes: [
          ["name", "title"],
          "amount",
          [
            sequelize.fn(
              "LOWER",
              sequelize.cast(sequelize.col("type"), "text"),
            ),
            "type",
          ],
          ["predicted_next_date", "date"],
          // "frequency",
        ],
        raw: true,
      });

      // const previousCalEvents = Recurring.findAll({
      //   where: {
      //     user_id: user.id,
      //     account_id: selected_account_id,
      //   },
      // });
      const calEvents = upcomingCalEvents.map((e) => ({
        title: e.title,
        date: e.date,
        extendedProps: {
          type: e.type,
          amount: e.amount,
        },
      }));

      // console.log(calEvents);
      return res.status(200).json(calEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
};
