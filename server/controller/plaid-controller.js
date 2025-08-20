const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

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

const getAccountData = async (id, accessToken) => {
  const balanceRes = await client.accountsBalanceGet({
    access_token: accessToken,
  });

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

  return updatedUser;
};

const getTransactionData = async (id, accessToken) => {
  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const transactions = [];

  let offset = 0;
  const pageSize = 100;

  while (true) {
    const transactionRes = await client.transactionsGet({
      access_token: accessToken,
      start_date: lastYear,
      end_date: today,
      options: { count: pageSize, offset: offset },
    });
    const transactionpage = transactionRes.data.transactions;
    transactions.push(...transactionpage);

    if (transactions.length < pageSize) break;

    offset += pageSize;
  }

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
          name: tv.name,
          date: tv.date,
          amount: Math.abs(tv.amount),
          type: tv.amount < 0 ? "income" : "expense",
        },
      },
      upsert: true,
    },
  }));

  const updatedTransactions = await Transaction.bulkWrite(tvInsert);

  return updatedTransactions;
};

module.exports = {
  async create_link_token({ body }, res) {
    try {
      // Get the client_user_id by searching for the current user
      const user = await User.findOne({ _id: body._id });
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
  async exchange_PublicToken({ body, params }, res) {
    try {
      const { id } = params;
      const { public_token } = body;
      const response = await client.itemPublicTokenExchange({ public_token });
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // console.log(accessToken);
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { plaidAccessToken: accessToken } },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Unable to find user" });
      }

      res.json(accessToken);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `Failed to exchange public token: ${error}` });
    }
  },

  async fetchAccountData({ body, params }, res) {
    const { id } = params;
    const { accessToken } = body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const lastUpdated = user.last_updated;
      const now = Date.now();
      const readyToUpdate =
        !lastUpdated || now - lastUpdated.getTime() >= SIX_HOURS;

      if (!readyToUpdate) {
        console.log("Not ready to update");
        return res.status(200).json(user);
      }

      console.log("Updating now");

      const accountUser = await getAccountData(id, accessToken);
      if (!accountUser) {
        return res.status(404).json({ message: "Unable to update accounts" });
      }

      const transactions = await getTransactionData(id, accessToken);
      if (!transactions) {
        return res
          .status(404)
          .json({ message: "Unable to update transactions" });
      }

      return res.status(200).json({
        message: "Accounts and transactions updated",
        accounts: accountUser.accounts,
        transactionsCount: transactions.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Failed to store updated account information",
        error: error.message,
      });
    }
  },
};
