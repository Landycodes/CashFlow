const router = require("express").Router();
const { getRecurringBills } = require("../../controller/recurring-controller");

router.route("/getRecurringbills").get(getRecurringBills);

module.exports = router;
