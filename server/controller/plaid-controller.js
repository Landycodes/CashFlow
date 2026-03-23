// const Transaction = require("../models/Transactions");
// const User = require("../models/Users");
const { Transactions, Users } = require("../models");
const {
  setAccountInfo,
  setTransactionInfo,
  setRecurringInfo,
} = require("./services/plaidService");
const { PlaidApi, PlaidEnvironments } = require("plaid");
require("dotenv").config();

const SIX_HOURS = 1000 * 60 * 60 * 6;

// PLAID PRODUCTION AND SANDBOX CHANGE HERE
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
  async create_link_token({ user = null, ACCESS_TOKEN = null }, res) {
    if (!user) return res.status(404).json({ error: "User Not Found" });

    try {
      const clientUserId = user.id;
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

      if (ACCESS_TOKEN) {
        request.access_token = ACCESS_TOKEN;
      }

      const createTokenResponse = await client.linkTokenCreate(request);
      res.json(createTokenResponse.data);
    } catch (error) {
      console.error(
        "Error creating Plaid link token:",
        error.response ? error.response.data : error,
      );
      res.status(400).json({ error: `failed to create link token: ${error}` });
    }
  },
  async exchange_PublicToken({ user = null, body }, res) {
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    try {
      const id = user.id;
      const { public_token } = body;
      console.log(id, public_token);
      const response = await client.itemPublicTokenExchange({ public_token });
      const accessToken = response.data.access_token;

      const [updated] = await Users.update(
        { plaidAccessToken: accessToken },
        {
          where: { id },
          individualHooks: true,
        },
      );

      if (!updated) {
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
      const foundUser = await Users.findByPk(user.id);

      if (!foundUser) {
        return res.status(404).json({ fetchAccountData: "User not found" });
      }

      const plaidAccessToken = foundUser.getPlaidAccessToken();
      const { id } = foundUser;

      const readyToUpdate =
        !foundUser.last_updated ||
        Date.now() - foundUser.last_updated.getTime() >= SIX_HOURS;

      // if (!readyToUpdate) {
      //   console.log("Not ready to update");
      //   return res.status(200).json(foundUser);
      // }

      console.log("Updating now");

      const [accountInfo, transactions] = await Promise.all([
        setAccountInfo(client, id, plaidAccessToken),
        setTransactionInfo(client, id, plaidAccessToken),
      ]);

      // Retrieving user after selected_account_id has been set
      const { selected_account_id } = await Users.findByPk(user.id, {
        attributes: ["selected_account_id"],
        raw: true,
      });

      const recurring = await setRecurringInfo(
        client,
        id,
        plaidAccessToken,
        selected_account_id,
      );

      // console.log("setting bill info");
      // const bills = await setBillInfo(
      //   client,
      //   id,
      //   plaidAccessToken,
      //   selected_account_id,
      // );

      if (!accountInfo || !transactions || !recurring) {
        return res.status(400).json({
          fetchAccountData: "One or more services failed",
          accountInfo: accountInfo,
          transactions: transactions,
          recurring: recurring,
        });
      }

      console.log("Account Update Successfull!");
      return res.status(200).end();
    } catch (error) {
      console.error(error);
      if (error?.response?.data?.error_code === "ITEM_LOGIN_REQUIRED") {
        return res.status(401).json({ API_error: "LOGIN_REQUIRED" });
      }
      return res.status(500).json({
        fetchAccountData: "Failed to store updated account information",
        API_error: String(error),
      });
    }
  },
};
