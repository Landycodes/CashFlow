const router = require("express").Router();
const { authMiddleware } = require("../../utils/auth");
const {
  getTransactionTotals,
  deleteUserTransactions,
  getTransactionList,
  getTransactionGroups,
} = require("../../controller/transaction-controller");

router
  .route("/getTransactions/Totals")
  .post(authMiddleware, getTransactionTotals);

router.route("/getTransactions/List").get(authMiddleware, getTransactionList);

router
  .route("/getTransactions/Groups")
  .post(authMiddleware, getTransactionGroups);

router
  .route("/deleteUserTransactions")
  .delete(authMiddleware, deleteUserTransactions);

module.exports = router;
