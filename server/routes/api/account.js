const router = require("express").Router();
const {
  getSingleAccount,
  removeAllAccounts,
  getAllAccounts,
  // addBill,
  // deleteBill,
  // getBills,
} = require("../../controller/account-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/getAccount").get(authMiddleware, getSingleAccount);
router.route("/removeAllAccounts").get(authMiddleware, removeAllAccounts);
router.route("/getAllAccounts").get(authMiddleware, getAllAccounts);
// router.route("/addBill/:user_id/:account_id").post(addBill);
// router.route("/deleteBill/:user_id/:account_id").post(deleteBill);
// router.route("/getBills").get(authMiddleware, getBills);

module.exports = router;
