const router = require("express").Router();
const {
  getAllRecurring,
  getNextRecurring,
} = require("../../controller/recurring-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/getAllRecurring").post(authMiddleware, getAllRecurring);
router.route("/getNextRecurring").get(authMiddleware, getNextRecurring);

module.exports = router;
