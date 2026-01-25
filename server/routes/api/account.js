const router = require("express").Router();
const {
  addBill,
  deleteBill,
  getBills,
} = require("../../controller/account-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/addBill/:user_id/:account_id").post(addBill);
router.route("/deleteBill/:user_id/:account_id").post(deleteBill);
router.route("/getBills").get(authMiddleware, getBills);

module.exports = router;
