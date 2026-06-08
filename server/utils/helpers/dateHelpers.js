import { sequelize } from "../../models/index.js";

export async function predictNextDates(userId, accountId, streamIds) {
  if (streamIds.length <= 0) return {};

  const transactions = await sequelize.query(
    `
      SELECT
      	R.PLAID_STREAM_ID,
      	ARRAY_AGG(T.DATE::date ORDER BY T.DATE ASC) AS DATES
      FROM TRANSACTIONS T
      JOIN RECURRING R
      	ON T.PLAID_ENTITY_ID = R.PLAID_ENTITY_ID
      WHERE R.PLAID_STREAM_ID = ANY(ARRAY[:streamIds])
      AND T.USER_ID = :userId
      AND T.ACCOUNT_ID = :accountId
      GROUP BY R.PLAID_STREAM_ID  
      `,
    {
      replacements: { userId, accountId, streamIds },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  const streamDateMap = {};
  for (const row of transactions) {
    const dates = row.dates.map((d) => new Date(d));
    if (dates.length < 2) continue;
    let totalInterval = 0;
    for (let i = 1; i < dates.length; i++) {
      totalInterval += dates[i] - dates[i - 1];
    }
    const avg = totalInterval / (dates.length - 1);
    const lastDate = dates[dates.length - 1];
    streamDateMap[row.plaid_stream_id] = new Date(lastDate.getTime() + avg)
      .toISOString()
      .split("T")[0];
  }

  return streamDateMap;
}
