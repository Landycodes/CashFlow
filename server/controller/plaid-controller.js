const Transaction = require("../models/Transaction");
const User = require("../models/User");
const {
  setAccountInfo,
  setTransactionInfo,
  setBillInfo,
} = require("./services/plaidService");
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

module.exports = {
  async create_link_token({ user = null }, res) {
    if (!user) return res.status(404).json({ error: "User Not Found" });

    try {
      const clientUserId = user._id;
      const request = {
        user: {
          client_user_id: clientUserId,
        },
        client_name: "Cashflow",
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
  async exchange_PublicToken({ user = null, body }, res) {
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    try {
      const id = user._id;
      const { public_token } = body;
      console.log(id, public_token);
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

      const { id, plaidAccessToken, selected_account_id } =
        foundUser.toObject();

      const readyToUpdate =
        !foundUser.last_updated ||
        Date.now() - foundUser.last_updated.getTime() >= SIX_HOURS;

      if (!readyToUpdate) {
        console.log("Not ready to update");
        return res.status(200).json(foundUser);
      }

      console.log("Updating now");

      // Bills have to be set after account info is updated
      const [accountInfo, transactions] = await Promise.all([
        setAccountInfo(id, plaidAccessToken),
        setTransactionInfo(id, plaidAccessToken),
      ]);
      const bills = await setBillInfo(
        id,
        plaidAccessToken,
        selected_account_id
      );

      if (!accountInfo || !transactions || !bills) {
        return res.status(400).json({
          fetchAccountData: "One or more services failed",
          accountInfo: accountInfo,
          transactions: transactions,
          bills: bills,
        });
      }

      console.log("Account Update Successfull!");
      return res.status(200).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        fetchAccountData: "Failed to store updated account information",
        error: error.message,
      });
    }
  },
};
