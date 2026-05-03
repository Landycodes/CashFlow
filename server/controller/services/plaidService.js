//###################
const TEST_ACCOUNT_DATA = require("../../../TESTDATA/_Raw_Account.json");
const TEST_TRANSACTION_DATA = require("../../../TESTDATA/_Raw_Transactions.json");
const TEST_RECURRING_DATA = require("../../../TESTDATA/_Raw_Recurring.json");
const TESTING = true;
const GATHERING_DATA = false;
//###################

const { Users, Transactions, Accounts, Recurring } = require("../../models");
const { getSelectedAccountId } = require("../services/userService");
const { Op } = require("sequelize");
require("dotenv").config();

// ########### USED TO CAPTURE DATA FOR TEST #################
const fs = require("fs").promises;
const path = require("path");

const writeToJSONFile = async (filename, data, id = null) => {
  const filepath = path.join(__dirname, "../../../TESTDATA", filename);

  try {
    if (id !== null) {
      const affectedTransactionIds = data.map((t) => t.transaction_id);
      const affectedAccountIds = data.map((t) => t.account_id);

      data = await Transactions.findAll({
        where: {
          user_id: id,
          account_id: { [Op.in]: affectedAccountIds },
          transaction_id: { [Op.in]: affectedTransactionIds },
        },
      });
    }

    if (!data) return;

    const result = JSON.stringify(data, null, 2);
    await fs.writeFile(filepath, result);
    console.log(`Data written to ${filename}`);
  } catch (err) {
    console.error(`Failed to write ${filepath}:`, err);
  }
};

const predictNextDate = async (tx_ids) => {
  if (tx_ids.length < 2) {
    return null;
  }

  const transactions = await Transactions.findAll({
    where: {
      transaction_id: { [Op.in]: tx_ids },
    },
    attributes: ["date"],
    order: [["date", "ASC"]],
  });

  const dates = transactions.map((t) => t.date);

  let totalInterval = 0;
  for (let i = 1; i < dates.length; i++) {
    totalInterval += dates[i] - dates[i - 1];
  }

  const avg = totalInterval / (dates.length - 1);
  const lastDate = dates[dates.length - 1];

  return new Date(lastDate.getTime() + avg);
};

// TODO fix this function
const parsePlaidName = (plaidName, isKey = true) => {
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
};

module.exports = {
  async setAccountInfo(client, id, plaidAccessToken) {
    console.log("Setting Account Info...");

    let balanceRes;

    try {
      if (TESTING) {
        balanceRes = {};
        balanceRes.data = TEST_ACCOUNT_DATA;
      } else {
        balanceRes = await client.accountsBalanceGet({
          access_token: plaidAccessToken,
        }); // make const in prod
      } // TEST CONFIG

      if (GATHERING_DATA) {
        writeToJSONFile("_Raw_Account.json", balanceRes.data);
      } // TEST CONFIG
      const balanceData = balanceRes.data.accounts;
      const accountValues = balanceData.map((bd) => ({
        name: bd.name,
        account_id: bd.account_id,
        available_balance: bd.balances.available,
        user_id: id,
      }));

      await Promise.all(
        accountValues.map((account) => Accounts.upsert(account)),
      );

      const [updated] = await Users.update(
        {
          selected_account_id: accountValues[0].account_id,
          last_updated: new Date(),
        },
        {
          where: { id },
          individualHooks: true,
        },
      );

      if (!updated) {
        throw new Error("Unable to find user");
      }

      const updatedUser = await Users.findByPk(id, {
        include: [{ model: Accounts, as: "accounts" }],
      });

      if (GATHERING_DATA) {
        writeToJSONFile("Account.json", updatedUser);
      }

      return updatedUser;
    } catch (error) {
      // console.error(error);
      if (error?.response?.data) {
        throw error;
      } else {
        throw new error({ setRecurringInfo: error });
      }
    }
  },
  async setTransactionInfo(client, id, plaidAccessToken) {
    console.log("Setting Transaction Info...");

    try {
      let transactions;
      if (TESTING) {
        transactions = TEST_TRANSACTION_DATA;
      } else {
        const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const today = new Date().toISOString().split("T")[0];

        transactions = []; // Make const in prod

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
      } // TEST CONFIG

      if (GATHERING_DATA) {
        writeToJSONFile("_Raw_Transactions.json", transactions);
      } // TEST CONFIG

      // TODO function to clean name in map

      const txInsert = transactions.map((tx) => ({
        user_id: id,
        account_id: tx.account_id,
        transaction_id: tx.transaction_id,
        plaid_entity_id: tx.merchant_entity_id ?? parsePlaidName(tx.name),
        name: tx.merchant_name ?? parsePlaidName(tx.name, false),
        date: new Date(tx.date),
        amount: Math.abs(tx.amount),
        type: tx.amount < 0 ? "INCOME" : "EXPENSE",
      }));

      const updatedTransactions = await Transactions.bulkCreate(txInsert, {
        ignoreDuplicates: true,
      });

      if (GATHERING_DATA) {
        writeToJSONFile("Transactions.json", transactions, id);
      } // TEST CONFIG

      return updatedTransactions;
    } catch (error) {
      if (error?.response?.data) {
        throw error;
      } else {
        throw new error({ setRecurringInfo: error });
      }
    }
  },
  async setRecurringInfo(client, id, plaidAccessToken) {
    console.log("Setting Recurring Info...");

    // Get refreshed selected account id for initial setup
    const selected_account_id = await getSelectedAccountId(id);

    if (!selected_account_id) throw new Error("No selected_account_id found");

    try {
      const request = {
        access_token: plaidAccessToken,
        account_ids: [selected_account_id],
      };

      let resData;
      if (TESTING) {
        resData = TEST_RECURRING_DATA;
      } else {
        const response = await client.transactionsRecurringGet(request);
        resData = response?.data; // make const in prod

        if (!resData.outflow_streams || !resData.inflow_streams) {
          throw new Error(
            "Recurring response did not give inflow/outflow streams",
          );
        }
      } // TEST CONFIG

      // console.log(resData);

      if (GATHERING_DATA) {
        writeToJSONFile("_Raw_Recurring.json", resData);
      } // TEST CONFIG

      const flowStreams = [
        ...resData.inflow_streams,
        ...resData.outflow_streams,
      ];

      const recurringTx = await Promise.all(
        flowStreams.map(async (fs) => {
          if (!fs?.predicted_next_date) {
            const pd = await predictNextDate(fs.transaction_ids);
            fs.predicted_next_date = pd;
          }
          const type = fs.average_amount.amount > 0 ? "BILL" : "PAYMENT";

          return {
            account_id: selected_account_id,
            user_id: id,
            name: fs.merchant_name,
            amount: Math.abs(fs.average_amount.amount),
            last_paid: fs.last_date,
            type: type,
            predicted_next_date: fs.predicted_next_date,
            frequency: fs.frequency,
            transactions: fs.transaction_ids,
            plaid_stream_id: fs.stream_id,
          };
        }),
      );

      if (GATHERING_DATA) {
        writeToJSONFile("Recurring.json", recurringTx);
      } // TEST CONFIG

      const updated = await Recurring.bulkCreate(recurringTx, {
        updateOnDuplicate: [
          "amount",
          "last_paid",
          "predicted_next_date",
          "transactions",
        ],
      });

      if (!updated) {
        throw new Error("Failed to update recurring table");
      }

      return updated;
    } catch (error) {
      if (error?.response?.data) {
        throw error;
      } else {
        throw new error({ setRecurringInfo: error });
      }
    }
  },
};
