const router = require("express").Router();
const {
  addBill,
  deleteBill,
  getBills,
} = require("../../controller/account-controller");

router.route("/addBill/:user_id/:account_id").post(addBill);
router.route("/deleteBill/:user_id/:account_id").post(deleteBill);
router.route("/getBills/:user_id/:account_id").get(getBills);

module.exports = router;
