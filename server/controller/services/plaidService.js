console.log(
  "Reading Plaid feature flags from: ",
  require.resolve("../../config/featureFlags"),
);

// prettier-ignore
const { TEST_ACCOUNT_DATA, TEST_TRANSACTION_DATA, TEST_RECURRING_DATA } = require("../../../TESTDATA/_config");
// prettier-ignore
const { Users, Transactions, Accounts, Recurring, sequelize } = require("../../models");
require("dotenv").config();
const { TESTING } = require("../../config/featureFlags");
const { writeToJSONFile } = require("../../utils/helpers/testHelpers");
const {
  getPaginatedTransactions,
  parsePlaidName,
  getPlaidEntityKeys,
} = require("../../utils/helpers/plaidHelpers");
const { predictNextDates } = require("../../utils/helpers/dateHelpers");
const { getSelectedAccountId } = require("../services/userService");
const { Op, Sequelize } = require("sequelize");

module.exports = {
  async setAccountInfo(client, id, plaidAccessToken) {
    console.log("Setting Account Info...");

    try {
      let balanceRes = TESTING
        ? { data: TEST_ACCOUNT_DATA }
        : await client.accountsBalanceGet({
            access_token: plaidAccessToken,
          });

      const balanceData = balanceRes.data.accounts;
      const accountValues = balanceData.map((bd) => ({
        name: bd.name,
        plaid_account_id: bd.account_id,
        available_balance: bd.balances.available,
        user_id: id,
      }));

      const upsertResult = await Promise.all(
        accountValues.map((account) => Accounts.upsert(account)),
      );

      const [firstInstance] = upsertResult[0];

      const [updated] = await Users.update(
        {
          selected_account_id: firstInstance.id,
        },
        {
          where: {
            id: id,
            selected_account_id: null,
          },
          individualHooks: true,
        },
      );

      const updatedUser = await Users.findByPk(id, {
        include: [{ model: Accounts, as: "accounts" }],
      });

      writeToJSONFile("_Raw_Account.json", balanceRes.data); // FOR TESTING
      writeToJSONFile("Account.json", updatedUser); // FOR TESTING
      return updatedUser;
    } catch (error) {
      console.error(error);
      if (error?.response?.data) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  },
  async setTransactionInfo(client, id, plaidAccessToken) {
    console.log("Setting Transaction Info...");

    try {
      const transactions = await getPaginatedTransactions(
        client,
        plaidAccessToken,
      );

      const txInsert = transactions.map((tx) => {
        // prettier-ignore
        const entity_id = tx.merchant_entity_id ?? tx.counterparties[0]?.entity_id ?? parsePlaidName(tx.name);
        // prettier-ignore
        const tx_name = tx.merchant_name ?? tx.counterparties[0]?.name ?? parsePlaidName(tx.name, false)
        return {
          user_id: id,
          account_id: tx.account_id,
          transaction_id: tx.transaction_id,
          plaid_entity_id: entity_id,
          name: tx_name,
          date: new Date(tx.date),
          amount: Math.abs(tx.amount),
          type: tx.amount < 0 ? "INCOME" : "EXPENSE",
        };
      });

      const updatedTransactions = await Transactions.bulkCreate(txInsert, {
        ignoreDuplicates: true,
      });

      writeToJSONFile("_Raw_Transactions.json", transactions); // FOR TESTING
      writeToJSONFile("Transactions.json", transactions, id); // FOR TESTING
      return updatedTransactions;
    } catch (error) {
      if (error?.response?.data) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  },
  async setRecurringInfo(client, user_id, plaidAccessToken) {
    console.log("Setting Recurring Info...");

    // Get refreshed selected account id for initial setup
    const selected_account_id = await getSelectedAccountId(user_id);
    if (!selected_account_id) throw new Error("No selected_account_id found");

    try {
      const request = {
        access_token: plaidAccessToken,
        account_ids: [selected_account_id],
      };

      const resData = TESTING
        ? TEST_RECURRING_DATA
        : await client.transactionsRecurringGet(request).then((r) => r?.data);

      if (!resData) {
        throw new Error(
          "Recurring response did not give inflow/outflow streams",
        );
      }

      const flowStreams = [
        ...resData.inflow_streams,
        ...resData.outflow_streams,
      ];

      const entityIdMap = await getPlaidEntityKeys(
        user_id,
        selected_account_id,
      );

      const dirtyDateIds = flowStreams
        .filter(
          (fs) =>
            !fs.predicted_next_date ||
            new Date(fs.predicted_next_date) < new Date(),
        )
        .flatMap((fs) => fs.stream_id);

      const predicted_dates = await predictNextDates(
        user_id,
        selected_account_id,
        dirtyDateIds,
      );

      const recurringTx = await Promise.all(
        flowStreams.map(async (fs) => {
          if (entityIdMap[fs.stream_id]) {
            fs.plaid_entity_id = entityIdMap[fs.stream_id];
          }
          if (predicted_dates[fs.stream_id]) {
            fs.predicted_next_date = predicted_dates[fs.stream_id];
          }

          return {
            account_id: selected_account_id,
            user_id: user_id,
            name: fs.merchant_name || fs.description,
            amount: Math.abs(fs.average_amount.amount),
            last_paid: fs.last_date,
            type: fs.average_amount.amount > 0 ? "BILL" : "PAYMENT",
            predicted_next_date: fs.predicted_next_date,
            frequency: fs.frequency,
            transactions: fs.transaction_ids,
            plaid_stream_id: fs.stream_id,
            plaid_entity_id: fs.plaid_entity_id,
          };
        }),
      );

      const updated = await Recurring.bulkCreate(recurringTx, {
        updateOnDuplicate: [
          "amount",
          "last_paid",
          "predicted_next_date",
          "transactions",
          "plaid_entity_id",
        ],
      });

      if (!updated.length) {
        throw new Error("Failed to update recurring table");
      }

      writeToJSONFile("_Raw_Recurring.json", resData); // FOR TESTING
      writeToJSONFile("Recurring.json", recurringTx); // FOR TESTING
      return updated;
    } catch (error) {
      if (error?.response?.data) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  },
};
