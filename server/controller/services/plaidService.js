const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const { PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

const client = new PlaidApi({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET_SANDBOX,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const fs = require("fs");
const writeToJSONFile = async (filepath, data, id = null) => {
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
  async setAccountInfo(id, plaidAccessToken) {
    const balanceRes = await client.accountsBalanceGet({
      access_token: plaidAccessToken,
    });

    //#################################################################################
    writeToJSONFile("../ufAccountData.json", balanceRes.data);
    //#################################################################################

    const balanceData = balanceRes.data.accounts;
    let accountValues = [];

    balanceData.forEach((bd) => {
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

    //#################################################################################
    writeToJSONFile("../AccountData.json", updatedUser);
    //#################################################################################

    return updatedUser;
  },
  async setTransactionInfo(id, plaidAccessToken) {
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

    //#################################################################################
    writeToJSONFile("../ufTransactionData.json", transactions);
    //#################################################################################

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

    //#################################################################################
    writeToJSONFile("../TransactionData.json", transactions, id);
    //#################################################################################

    return updatedTransactions;
  },
  async setBillInfo(data) {
    // console.log(data);
    console.log(data.inflow_streams);
    console.log(data.outflow_streams);
  },
};
