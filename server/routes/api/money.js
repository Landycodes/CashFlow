const router = require("express").Router();
const { addIncome, addExpense } = require("../../controller/money-controller");

router.route("/addincome").put(authMiddleware, addIncome);
router.route("/addexpense").put(authMiddleware, addExpense);

module.exports = router;
