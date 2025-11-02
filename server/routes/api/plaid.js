const router = require("express").Router();
const { authMiddleware } = require("../../utils/auth");

const {
  create_link_token,
  exchange_PublicToken,
  fetchAccountData,
} = require("../../controller/plaid-controller");

router.route("/create_link_token").get(authMiddleware, create_link_token);
router
  .route("/exchange_PublicToken")
  .post(authMiddleware, exchange_PublicToken);
router.route("/fetchAccountData").post(authMiddleware, fetchAccountData);

module.exports = router;
