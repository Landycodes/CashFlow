const { Users, Transactions, Accounts, Recurring } = require("../../models");
const { PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

//###################
const TEST_ACCOUNT_DATA = require("../../__Tests__/ufAccountData.json");
const TEST_TRANSACTION_DATA = require("../../__Tests__/ufTransactionData.json");
const TEST_BILL_DATA = require("../../__Tests__/ufBills.json");
//###################

// ########### USED TO CAPTURE DATA FOR TEST #################
const fs = require("fs");
const writeToJSONFile = async (filename, data, id = null) => {
  const filepath = `../../__Tests__/${filename}`;
  if (id != null) {
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

  const result = JSON.stringify(data, null, 2);
  fs.writeFileSync(filepath, result);
  console.log(`Data written to ${filepath}`);
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

module.exports = {
  async setAccountInfo(client, id, plaidAccessToken) {
    //#################  PRODUCTION API CALL #####################
    console.log("Setting Account Info...");
    try {
      const balanceRes = await client.accountsBalanceGet({
        access_token: plaidAccessToken,
      });

      // TEST API DATA INJECTION
      // const balanceRes = {};
      // balanceRes.data = TEST_ACCOUNT_DATA;

      // **
      // writeToJSONFile("ufAccountData.json", balanceRes.data);
      // **

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

      //**
      // writeToJSONFile("AccountData.json", updatedUser);
      //**

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to set account info: ${error}`);
    }
  },
  async setTransactionInfo(client, id, plaidAccessToken) {
    console.log("Setting Transaction Info...");
    //#################  PRODUCTION API METHOD #####################
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

    // TEST API DATA INJECTION
    // const transactions = TEST_TRANSACTION_DATA;

    //**
    // writeToJSONFile("../ufTransactionData.json", transactions);
    //**

    const txInsert = transactions.map((tx) => ({
      user_id: id,
      account_id: tx.account_id,
      transaction_id: tx.transaction_id,
      name: tx.merchant_name ?? tx.name,
      date: new Date(tx.date),
      amount: Math.abs(tx.amount),
      type: tx.amount < 0 ? "INCOME" : "EXPENSE",
    }));

    const updatedTransactions = await Transactions.bulkCreate(txInsert, {
      ignoreDuplicates: true,
    });

    //**
    // writeToJSONFile("../TransactionData.json", transactions, id);
    //**

    return updatedTransactions;
  },
  async setRecurringInfo(client, id, plaidAccessToken, selected_account_id) {
    console.log("Setting Recurring Info...");
    if (!selected_account_id) throw new Error("No selected_account_id found");

    try {
      const request = {
        access_token: plaidAccessToken,
        account_ids: [selected_account_id],
      };

      //#################  PRODUCTION API CALL #####################
      const response = await client.transactionsRecurringGet(request);
      const resData = response?.data;

      if (!resData.outflow_streams || !resData.inflow_streams) {
        throw new Error(
          "Recurring response did not give inflow/outflow streams",
        );
      }

      // TEST API DATA INJECTION
      // const response = {};
      // response.data = TEST_BILL_DATA;
      //**
      // writeToJSONFile("../ufBills.json", response.data);
      //**

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
          return {
            account_id: selected_account_id,
            name: fs.merchant_name,
            amount: Math.abs(fs.average_amount.amount.toFixed(2)),
            last_paid: fs.last_date,
            type: "BILL",
            predicted_next_date: fs.predicted_next_date,
            frequency: fs.frequency,
            charged_to: fs.account_id,
          };
        }),
      );

      //**
      // writeToJSONFile("../Bills.json", recurringTx);
      //**

      const [updated] = await Recurring.bulkCreate(recurringTx, {
        ignoreDuplicates: true,
      });

      if (!updated) {
        throw new Error("Failed to update recurring table");
      }

      return updated;
    } catch (error) {
      error.response ? console.log(error.response.data) : console.error(error);
    }
  },
};
