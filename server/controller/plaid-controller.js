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
  async getAccountBalance(req, res) {
    const { accessToken } = req.body;
    try {
      const response = await client.accountsBalanceGet({
        access_token: accessToken,
      });
      res.json(response.data.accounts);
    } catch (error) {
      console.error(error);
      // if (error?.response?.data?.error_code === "INVALID_ACCESS_TOKEN") {
      //   await User.updateOne({ _id: id }, { $unset: { plaidAccessToken: "" } });
      //   error = error.response.data.error_code;
      // }
      if (typeof error?.status === "number") {
        res.status(error.status).json({ error });
      } else {
        res.status(500).json({ error: "Failed to connect to plaid server" });
      }
    }
  },
  async getTransactionHistory(req, res) {
    const { accessToken } = req.body;
    try {
      const response = await client.transactionsGet({
        access_token: accessToken,
        start_date: "2025-01-01", // Adjust date range
        end_date: new Date().toISOString().split("T")[0],
        options: { count: 50, offset: 0 },
      });
      res.json(response.data.transactions);
    } catch (error) {
      console.error(error);
      // if (error?.response?.data?.error_code === "INVALID_ACCESS_TOKEN") {
      //   await User.updateOne({ _id: id }, { $unset: { plaidAccessToken: "" } });
      // }
      if (typeof error?.status === "number") {
        res.status(error.status).json({ error });
      } else {
        res.status(500).json({ error: "Failed to fetch transactions" });
      }
    }
  },
  // async removeAccessToken(req, res) {
  //   try {
  //     const { id } = req.body;
  //     const user = await User.updateOne(
  //       { _id: id },
  //       { $unset: { plaidAccessToken: "" } }
  //     );
  //     console.log(user);
  //     res.status(200).json(user);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(400).json({ error: "Unable to remove access token" });
  //   }
  // },
};
