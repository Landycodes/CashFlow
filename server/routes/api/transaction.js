const router = require("express").Router();
const { getTransactions } = require("../../controller/transaction-controller");

router.route("/getTransactions/:user_id/:account_id").get(getTransactions);

module.exports = router;
