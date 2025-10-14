const router = require("express").Router();
const { authMiddleware } = require("../../utils/auth");

const {
  create_link_token,
  exchange_PublicToken,
  fetchAccountData,
  getRecurringTransactions,
} = require("../../controller/plaid-controller");

router.route("/create_link_token").post(create_link_token);
router.route("/exchange_PublicToken/:id").post(exchange_PublicToken);
router.route("/fetchAccountData").post(authMiddleware, fetchAccountData);
router
  .route("/getrecurringTransactions")
  .get(authMiddleware, getRecurringTransactions);

module.exports = router;
