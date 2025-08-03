const router = require("express").Router();
const {
  create_link_token,
  exchange_PublicToken,
  getAccountBalance,
  getTransactionHistory,
  // removeAccessToken,
} = require("../../controller/plaid-controller");

router.route("/create_link_token").post(create_link_token);
router.route("/exchange_PublicToken").post(exchange_PublicToken);
router.route("/getAccountBalance").post(getAccountBalance);
router.route("/getTransactionHistory").post(getTransactionHistory);
// router.route("/removeaccesstoken").post(removeAccessToken);

module.exports = router;
