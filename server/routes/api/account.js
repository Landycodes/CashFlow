const router = require("express").Router();
const {
  getSingleAccount,
  removeAccount,
  // addBill,
  // deleteBill,
  // getBills,
} = require("../../controller/account-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/getAccount").get(authMiddleware, getSingleAccount);
router.route("/removeAccount").get(authMiddleware).post(removeAccount);
// router.route("/addBill/:user_id/:account_id").post(addBill);
// router.route("/deleteBill/:user_id/:account_id").post(deleteBill);
// router.route("/getBills").get(authMiddleware, getBills);

module.exports = router;
