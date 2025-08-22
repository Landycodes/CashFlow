const router = require("express").Router();
const {
  getTransactionTotals,
  deleteUserTransactions,
} = require("../../controller/transaction-controller");

router
  .route("/getTransactionTotals/:user_id/:account_id")
  .post(getTransactionTotals);
router.route("/deleteUserTransactions/:user_id").delete(deleteUserTransactions);
module.exports = router;
