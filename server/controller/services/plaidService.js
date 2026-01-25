const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
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

    data = await Transaction.find({
      user_id: id,
      account_id: { $in: affectedAccountIds },
      transaction_id: { $in: affectedTransactionIds },
    });
  }

  const result = JSON.stringify(data, null, 2);
  fs.writeFileSync(filepath, result);
  console.log(`Data written to ${filepath}`);
};

module.exports = {
  async setAccountInfo(client, id, plaidAccessToken) {
    //#################  PRODUCTION API CALL #####################
    // const balanceRes = await client.accountsBalanceGet({
    //     access_token: plaidAccessToken,
    //   });

    // TEST API DATA INJECTION
    const balanceRes = {};
    balanceRes.data = TEST_ACCOUNT_DATA;

    // **
    // writeToJSONFile("ufAccountData.json", balanceRes.data);
    // **

    const balanceData = balanceRes.data.accounts;
    let accountValues = [];

    balanceData.forEach((bd) => {
      // console.log(bd);
      accountValues.push({
        name: bd.name,
        account_id: bd.account_id,
        available_balance: bd.balances.available,
      });
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        accounts: accountValues,
        selected_account_id: accountValues[0].account_id,
        last_updated: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    //**
    // writeToJSONFile("AccountData.json", updatedUser);
    //**

    return updatedUser;
  },
  async setTransactionInfo(client, id, plaidAccessToken) {
    //#################  PRODUCTION API METHOD #####################
    // const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    //   .toISOString()
    //   .split("T")[0];
    // const today = new Date().toISOString().split("T")[0];

    // const transactions = [];

    // let offset = 0;
    // const pageSize = 100;

    // while (true) {
    //   const transactionRes = await client.transactionsGet({
    //     access_token: plaidAccessToken,
    //     start_date: lastYear,
    //     end_date: today,
    //     options: { count: pageSize, offset: offset },
    //   });

    //   const transactionpage = transactionRes.data.transactions;
    //   transactions.push(...transactionpage);

    //   if (transactionpage.length < pageSize) break;

    //   offset += pageSize;
    // }

    // TEST API DATA INJECTION
    const transactions = TEST_TRANSACTION_DATA;

    //**
    // writeToJSONFile("../ufTransactionData.json", transactions);
    //**

    const tvInsert = transactions.map((tv) => ({
      updateOne: {
        filter: {
          user_id: id,
          account_id: tv.account_id,
          transaction_id: tv.transaction_id,
        },
        update: {
          $setOnInsert: {
            user_id: id,
            account_id: tv.account_id,
            transaction_id: tv.transaction_id,
            name: tv.merchant_name ?? tv.name,
            date: tv.date,
            amount: Math.abs(tv.amount),
            type: tv.amount < 0 ? "income" : "expense",
          },
        },
        upsert: true,
      },
    }));

    const updatedTransactions = await Transaction.bulkWrite(tvInsert);

    //**
    // writeToJSONFile("../TransactionData.json", transactions, id);
    //**

    return updatedTransactions;
  },
  async setBillInfo(client, id, plaidAccessToken, selected_account_id) {
    if (!selected_account_id) return null;

    try {
      const request = {
        access_token: plaidAccessToken,
        account_ids: [selected_account_id],
      };

      //#################  PRODUCTION API CALL #####################
      // const response = await client.transactionsRecurringGet(request);

      // if (!response?.data?.outflow_streams) {
      //   console.log("No recurring bills found");
      //   return null;
      // }

      // TEST API DATA INJECTION
      const response = {};
      response.data = TEST_BILL_DATA;

      //**
      // writeToJSONFile("../ufBills.json", response.data);
      //**

      const bills = response.data.outflow_streams.map((bd) => ({
        name: bd.merchant_name,
        amount: Number(bd.average_amount.amount.toFixed(2)),
        last_paid: bd.last_date,
        next_due: bd.predicted_next_date,
        frequency: bd.frequency,
        charged_to: bd.account_id,
      }));

      const income = response.data.inflow_streams.map((inc) => ({
        name: inc.description,
        amount: Math.abs(inc.average_amount.amount.toFixed(2)),
        last_paid: inc.last_date,
        next_pay: inc.predicted_next_date,
        frequency: inc.frequency,
        deposited_to: inc.account_id,
      }));

      //**
      // writeToJSONFile("../Bills.json", bills);
      //**

      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        {
          $set: { bills: bills, income: income },
        },
        { new: true, runValidators: true }
      );
      //   console.log(updatedUser.accounts[0].bills);

      return updatedUser;
    } catch (error) {
      error.response ? console.log(error.response.data) : console.error(error);
    }
  },
};
