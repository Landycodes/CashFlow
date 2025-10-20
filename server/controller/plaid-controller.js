const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

// ################################
const fs = require("fs");
// ################################

const SIX_HOURS = 1000 * 60 * 60 * 6;

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

// Fetch Data Helper Function: Account Data
const setAccountInfo = async (id, plaidAccessToken) => {
  const balanceRes = await client.accountsBalanceGet({
    access_token: plaidAccessToken,
  });

  //#################################################################################
  const result = JSON.stringify(balanceRes.data, null, 2);

  fs.writeFileSync("../ufAccountData.json", result);
  console.log("unfiltered account data file created!");
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
  const filteredResult = JSON.stringify(updatedUser, null, 2);

  fs.writeFileSync("../AccountData.json", filteredResult);
  console.log("filtered account data file created!");
  //#################################################################################

  return updatedUser;
};

// Fetch Data Helper Function: Transaction Data
const setTransactionInfo = async (id, plaidAccessToken) => {
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
  const unfilteredResult = JSON.stringify(transactions, null, 2);

  fs.writeFileSync("../ufTransactionData.json", unfilteredResult);
  console.log("unfiltered transaction data file created!");
  //#################################################################################
  // console.log(transactions);

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
  const affectedTransactionIds = transactions.map((t) => t.transaction_id);

  const affectedAccountIds = transactions.map((t) => t.account_id);

  const affectedDocs = await Transaction.find({
    user_id: id,
    account_id: { $in: affectedAccountIds },
    transaction_id: { $in: affectedTransactionIds },
  });

  const filteredResult = JSON.stringify(affectedDocs, null, 2);

  fs.writeFileSync("../TransactionData.json", filteredResult);
  console.log("filtered transaction data file created!");
  //#################################################################################

  return updatedTransactions;
};

module.exports = {
  async create_link_token({ user = null }, res) {
    // const id = user.id
    try {
      // Get the client_user_id by searching for the current user
      // const foundUser = await User.findOne({ _id: id});
      if (!user) {
        return res.status(404).json({ error: "User Not Found" });
      }

      const clientUserId = user.id;
      const request = {
        user: {
          client_user_id: clientUserId,
        },
        client_name: "Plaid Test App",
        products: ["auth", "transactions"],
        language: "en",
        country_codes: ["US"],
        // Add this in later for real time updates
        // webhook: "https://webhook.example.com",
      };

      const createTokenResponse = await client.linkTokenCreate(request);
      res.json(createTokenResponse.data);
    } catch (error) {
      console.error(
        "Error creating Plaid link token:",
        error.response ? error.response.data : error
      );
      res.status(400).json({ error: `failed to create link token: ${error}` });
    }
  },
  async exchange_PublicToken({ body, user = null }, res) {
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    try {
      const id = user._id;
      const { public_token } = body;
      const response = await client.itemPublicTokenExchange({ public_token });
      const accessToken = response.data.access_token;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { plaidAccessToken: accessToken } },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "Unable to assign plaid token to user" });
      }

      res.status(200).end(); // res.json(accessToken);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `Failed to exchange public token: ${error}` });
    }
  },

  async fetchAccountData({ user = null }, res) {
    if (!user) {
      return res.status(404).json({ fetchAccountData: "Token user not found" });
    }

    try {
      const foundUser = await User.findById(user._id);

      if (!foundUser) {
        return res.status(404).json({ fetchAccountData: "User not found" });
      }

      const { id, plaidAccessToken } = foundUser.toObject();

      const readyToUpdate =
        !foundUser.last_updated ||
        Date.now() - foundUser.last_updated.getTime() >= SIX_HOURS;

      if (!readyToUpdate) {
        console.log("Not ready to update");
        return res.status(200).json(foundUser);
      }

      console.log("Updating now");

      const accountUser = await setAccountInfo(id, plaidAccessToken);
      if (!accountUser) {
        return res.status(404).json({ message: "Unable to update accounts" });
      }

      const transactions = await setTransactionInfo(id, plaidAccessToken);
      if (!transactions) {
        return res
          .status(404)
          .json({ message: "Unable to update transactions" });
      }

      return res.status(200).json(accountUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Failed to store updated account information",
        error: error.message,
      });
    }
  },
  async getRecurringTransactions({ user = null, params }, res) {
    if (!user) {
      return res
        .status(404)
        .json({ getRecurringTransactions: "Token user not found" });
    }
    const foundUser = await User.findById(user._id);

    // console.log(foundUser);

    if (!foundUser.plaidAccessToken) {
      return res
        .status(204)
        .json("getRecurringTransactions: No token assigned to user");
    }

    const request = {
      access_token: foundUser.plaidAccessToken,
      account_ids: [foundUser.selected_account_id],
    };

    try {
      const response = await client.transactionsRecurringGet(request);
      let inflowStreams = response.data.inflow_streams;
      let outflowStreams = response.data.outflow_streams;

      // console.log(inflowStreams);
      // console.log(outflowStreams);
      return res.status(200);
    } catch (error) {
      error.response ? console.log(error.response.data) : console.error(error);
      return res.status(500).json("Failed to get recurring transactions");
    }
  },
};
