const { Users, Transactions, Recurring, sequelize } = require("../models");
const { getSelectedAccountId } = require("../controller/services/userService");
const { Op } = require("sequelize");

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00"); // prevent timezone shift
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  return `${month} ${getOrdinal(day)}`;
};

module.exports = {
  async getAllRecurring({ user = null, body, headers }, res) {
    if (!user)
      return res.status(404).json({ getAllRecurring: "Token user not found" });

    const timezone = headers["x-timezone"] || "UTC";

    const selected_account_id = await getSelectedAccountId(user.id);
    const { type = null, limit = null } = body;

    try {
      const recurring = await sequelize.query(
        `
SELECT
  COALESCE(
    (SELECT x.given_name FROM xref x 
     JOIN transactions t ON t.plaid_entity_id = x.plaid_entity_id
     WHERE t.transaction_id = ANY(r.transactions)
     LIMIT 1),
    r.name
  ) AS name,
  r.amount,
  r.frequency,
  r.type,
  r.id,
  TO_CHAR(r.last_paid, 'MM/DD/YYYY') AS last_paid,
  TO_CHAR(r.predicted_next_date, 'MM/DD/YYYY') AS next_due,
  r.predicted_next_date::date - (NOW() AT TIME ZONE :timezone)::date AS days_away
FROM recurring r
WHERE r.user_id = :userId
AND r.account_id = :accountId
AND r.predicted_next_date IS NOT NULL
AND r.predicted_next_date::date >= (NOW() AT TIME ZONE :timezone)::date
${type ? "AND r.type = :type" : ""}
ORDER BY r.predicted_next_date ASC
${limit ? "LIMIT :limit" : ""}
  `,
        {
          replacements: {
            userId: user.id,
            accountId: selected_account_id,
            timezone,
            ...(type && { type }),
            ...(limit && { limit }),
          },
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (recurring.length <= 0)
        return res
          .status(200)
          .json({ response: "No recurring payments found." });

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

      const baseWhere = {
        user_id: user.id,
        account_id: selected_account_id,
        predicted_next_date: { [Op.gte]: new Date() },
      };

      const nextPaymentDate = await Recurring.min("predicted_next_date", {
        where: { ...baseWhere, type: "PAYMENT" },
      });

      if (!nextPaymentDate) {
        return res
          .status(200)
          .json({ getNextRecurring: "No upcoming payments found" });
      }

      const nextRecurring = await Recurring.findAll({
        where: {
          ...baseWhere,
          predicted_next_date: {
            [Op.gte]: new Date(),
            [Op.lte]: nextPaymentDate,
          },
        },
        attributes: ["amount", "predicted_next_date", "type"],
        raw: true,
      });

      const nextPayment = nextRecurring.filter(
        (tx) => tx.type === "PAYMENT",
      )[0];
      const nextBills = nextRecurring.filter((tx) => tx.type === "BILL");
      const billTotal = nextBills.reduce(
        (acc, cur) => acc + parseFloat(cur.amount),
        0,
      );

      res.status(200).json({
        nextPayment: {
          amount: nextPayment?.amount,
          date: nextPaymentDate ? formatDate(nextPaymentDate) : null,
        },
        billTotal,
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

      const upcomingCalEvents = await sequelize.query(
        `
SELECT DISTINCT
  COALESCE(x.given_name, r.name) AS name,
  r.amount,
  LOWER(r.type::TEXT) AS type,
  r.predicted_next_date AS date
FROM recurring r
LEFT JOIN transactions t ON t.transaction_id = ANY(r.transactions)
LEFT JOIN xref x ON x.plaid_entity_id = t.plaid_entity_id
WHERE r.user_id = :userId
AND r.account_id = :accountId
        `,
        {
          replacements: {
            userId: user.id,
            accountId: selected_account_id,
          },
          type: sequelize.QueryTypes.SELECT,
        },
      );

      const calEvents = upcomingCalEvents.map((e) => ({
        title:
          e.type === "payment"
            ? `$${Number(e.amount).toLocaleString()}`
            : `-$${Number(e.amount).toLocaleString()}`,
        date: e.date,
        extendedProps: {
          type: e.type,
          name: e.name,
        },
      }));

      return res.status(200).json(calEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
};
