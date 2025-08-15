const User = require("../models/User");
require("dotenv").config();
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

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

const getAccountData = async (accessToken) => {
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

  return accountValues;
};

const getTransactionData = async (accessToken) => {
  let incomeValues = [];
  let expenseValues = [];

  const transactionRes = await client.transactionsGet({
    access_token: accessToken,
    start_date: "2025-01-01", // Adjust date range
    end_date: new Date().toISOString().split("T")[0],
    options: { count: 50, offset: 0 },
  });
  // console.log(transactionRes.data.transactions);
  const transactions = transactionRes.data.transactions;

  transactions.forEach((tv) => {
    // console.log(tv);
    if (tv.amount < 0) {
      incomeValues.push({
        name: tv.name,
        account_id: tv.account_id,
        date: tv.date,
        amount: tv.amount,
      });
    } else {
      expenseValues.push({
        name: tv.name,
        account_id: tv.account_id,
        date: tv.date,
        amount: tv.amount,
      });
    }
  });

  return { incomeValues, expenseValues };
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
  async exchange_PublicToken(req, res) {
    try {
      const { public_token } = req.body;
      const response = await client.itemPublicTokenExchange({ public_token });
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // console.log(accessToken);
      res.json({ accessToken, itemId });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `Failed to exchange public token: ${error}` });
    }
  },

  async fetchAccountData(req, res) {
    const { id, accessToken } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json("Unable to find user to update account info");
      }
      const lastUpdated = user?.lastUpdated;
      const now = new Date();
      const sixHours = 21600000;
      const readyToUpdate = now - lastUpdated >= sixHours;

      if (lastUpdated === undefined || readyToUpdate) {
        const accountValues = await getAccountData(accessToken);
        const transactionValues = await getTransactionData(accessToken);

        const updatedAccount = await User.findByIdAndUpdate(
          id,
          {
            accounts: accountValues,
            income: transactionValues.incomeValues,
            expense: transactionValues.expenseValues,
            lastUpdated: new Date().toISOString(),
          },
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedAccount) {
          return res
            .status(404)
            .json({ message: "User not found, Unable to update accounts." });
        }

        res.json(updatedAccount);
      } else {
        res.status(200);
      }
    } catch (error) {
      console.error(error);
      res.status(400).json("Failed to store updated account information");
    }
  },
};
