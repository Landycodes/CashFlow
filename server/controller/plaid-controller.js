const User = require("../models/User");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

module.exports = {
  async create_link_token({ body }, res) {
    try {
      const config = new Configuration({
        basePath: PlaidEnvironments.sandbox,
        baseOptions: {
          headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
            "PLAID-SECRET": process.env.PLAID_SECRET_SANDBOX,
            "Plaid-Version": "2020-09-14",
          },
        },
      });

      const client = new PlaidApi(config);

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
      const itemId = response.date.item_id;

      res.json({ accessToken, itemId });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: `Failed to exchange public token: ${error}` });
    }
  },
  async getAccountBalance(req, res) {
    try {
      const { accessToken } = req.body;
      const response = await plaidClient.accountsBalanceGet({
        access_token: accessToken,
      });
      res.json(response.data.accounts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch account balance" });
    }
  },
  async getTransactionHistory(req, res) {
    try {
      const { accessToken } = req.body;
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: "2024-01-01", // Adjust date range
        end_date: new Date().toISOString().split("T")[0],
        options: { count: 10, offset: 0 },
      });
      res.json(response.data.transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },
};
