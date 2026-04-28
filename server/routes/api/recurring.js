const router = require("express").Router();
const {
  getAllRecurring,
  getNextRecurring,
  getRecurringCalEvents,
} = require("../../controller/recurring-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/getAllRecurring").post(authMiddleware, getAllRecurring);
router.route("/getNextRecurring").get(authMiddleware, getNextRecurring);
router
  .route("/getRecurringCalEvents")
  .get(authMiddleware, getRecurringCalEvents);

module.exports = router;
