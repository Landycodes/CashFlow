const router = require("express").Router();
const {
  getRecurringBills,
  getNextRecurring,
} = require("../../controller/recurring-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/getRecurringbills").get(getRecurringBills);
router.route("/getNextRecurring").get(authMiddleware, getNextRecurring);

module.exports = router;
