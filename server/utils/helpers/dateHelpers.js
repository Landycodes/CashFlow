import { sequelize } from "../../models/index.js";

// MATH IS VERY WRONG HERE*********************************
export async function predictNextDate(tx_ids) {
  // calculate interval from at least 2 dates
  if (tx_ids.length < 2) {
    return null;
  }

  const transactions = await sequelize.query(
    ` SELECT T.DATE 
      FROM TRANSACTIONS T 
      WHERE T.PLAID_ENTITY_ID IN (
        SELECT DISTINCT T2.PLAID_ENTITY_ID
        FROM TRANSACTIONS T2
        WHERE T2.TRANSACTION_ID IN ( :txIds )
      )
      ORDER BY T.DATE ASC`,
    {
      replacements: { txIds: tx_ids },
      type: sequelize.QueryTypes.SELECT,
    },
  );
  const dates = transactions.map((t) => t.date);

  // average days between each payment
  let totalInterval = 0;
  for (let i = 1; i < dates.length; i++) {
    totalInterval += dates[i] - dates[i - 1];
  }
  const avg = totalInterval / (dates.length - 1);

  // most recent date
  const lastDate = dates[dates.length - 1];

  console.log("last date: ", lastDate.toISOString().split("T")[0]);
  console.log(
    "predicted date: ",
    new Date(lastDate.getTime() + avg).toISOString().split("T")[0],
  );
  return new Date(lastDate.getTime() + avg).toISOString().split("T")[0];
}
