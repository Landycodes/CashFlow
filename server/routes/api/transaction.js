const router = require("express").Router();
const {
  getTransactionTotals,
  deleteUserTransactions,
  getTransactionList,
} = require("../../controller/transaction-controller");

router
  .route("/getTransactionTotals/:user_id/:account_id")
  .post(getTransactionTotals);

router
  .route("/getTransactionList/:user_id/:account_id")
  .get(getTransactionList);

router.route("/deleteUserTransactions/:user_id").delete(deleteUserTransactions);

module.exports = router;
