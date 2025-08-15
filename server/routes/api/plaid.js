const router = require("express").Router();
const {
  create_link_token,
  exchange_PublicToken,
  getAccountBalance,
  getTransactionHistory,
  fetchAccountData,
} = require("../../controller/plaid-controller");

router.route("/create_link_token").post(create_link_token);
router.route("/exchange_PublicToken").post(exchange_PublicToken);
router.route("/fetchAccountData").post(fetchAccountData);

module.exports = router;
