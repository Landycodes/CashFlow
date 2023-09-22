const User = require("../models/User");
const {
  Configuration,
  PlaidApi,
  products,
  PlaidEnvironments,
} = require("plaid");

module.exports = {
  async create_link_token({ body }, res) {
    const config = new Configuration();
    ({
      basePath: PlaidEnvironments["sandbox"],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": process.env.client_id,
          "PLAID-SECRET": process.env.sandboxsecret,
          "Plaid-Version": "2020-09-14",
        },
      },
    });

    const client = new PlaidApi(config);

    // Get the client_user_id by searching for the current user
    const user = await User.findOne({ _id: body._id });
    const clientUserId = user.id;
    console.log(clientUserId);
    const request = {
      user: {
        // This should correspond to a unique id for the current user.
        client_user_id: clientUserId,
      },
      client_name: "Plaid Test App",
      products: ["auth", "transactions"],
      language: "en",
      webhook: "https://webhook.example.com",
      redirect_uri: "https://domainname.com/oauth-page.html",
      country_codes: ["US"],
    };
    try {
      const createTokenResponse = await client.linkTokenCreate(request);
      res.json(createTokenResponse.data);
    } catch (error) {
      res.status(400).json(error);
    }
  },
};
