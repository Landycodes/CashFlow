import { TESTING } from "../../config/featureFlags.js";
import { createRequire } from "module";
import { sequelize } from "../../models/index.js";
const require = createRequire(import.meta.url);
const { TEST_TRANSACTION_DATA } = require("../../../TESTDATA/_config.js");

export function parsePlaidName(plaidName, isKey = true) {
  let parsedName = plaidName
    .toLowerCase()
    // strip MCC codes
    .replace(/\bmcc\s*\d{4}\b/g, "")
    // strip card numbers
    .replace(/#\d+/g, "")
    // strip "card 15", "card xx", etc
    .replace(/\bcard\s+\w+\b/g, "")
    // strip "date x xx x" patterns
    .replace(/\bdate(\s+x)+\b/g, "")
    // strip 4-digit codes that look like category IDs
    .replace(/\b\d{4}\b/g, "")
    // strip state abbreviations like "AZ"
    .replace(/\b[A-Z]{2}\b/g, "");

  if (isKey) {
    parsedName = parsedName.replace(/\s+/g, " ").trim().replace(/\s/g, "-");
  } else {
    parsedName = parsedName.replace(/\s+/g, " ").trim();
  }
  return parsedName;
}

export async function getPaginatedTransactions(client, plaidAccessToken) {
  if (TESTING) return TEST_TRANSACTION_DATA;

  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const transactions = [];

  let offset = 0;
  const pageSize = 100;

  while (true) {
    const transactionRes = await client.transactionsGet({
      access_token: plaidAccessToken,
      start_date: lastYear,
      end_date: today,
      options: { count: pageSize, offset: offset },
    });

    const transactionpage = transactionRes.data.transactions;
    transactions.push(...transactionpage);

    if (transactionpage.length < pageSize) break;

    offset += pageSize;
  }

  return transactions;
}

export async function getPlaidEntityKeys(userId, accountId) {
  const keys = await sequelize.query(
    `
    SELECT DISTINCT 
    R.PLAID_STREAM_ID,
    T.PLAID_ENTITY_ID 
    FROM RECURRING R
    LEFT JOIN TRANSACTIONS T 
    ON T.TRANSACTION_ID = ANY(R.TRANSACTIONS)
    WHERE T.USER_ID = :userId
    AND T.ACCOUNT_ID = :accountId
   `,
    {
      replacements: { userId, accountId },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  const keyMap = {};
  for (const key of keys) {
    keyMap[key.plaid_stream_id] = key.plaid_entity_id;
  }
  return keyMap;
}
