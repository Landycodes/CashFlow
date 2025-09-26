const router = require("express").Router();
const userRoutes = require("./user");
const transactionRoutes = require("./transaction");
const accountRoutes = require("./account");
const fireRoutes = require("./firebase");
const plaidRoutes = require("./plaid");

router.use("/", userRoutes);
router.use("/transaction", transactionRoutes);
router.use("/account", accountRoutes);
router.use("/plaid", plaidRoutes);
router.use("/firebase", fireRoutes);
router.get("*", (req, res) => {
  res.json({ Msg: "You are on the wrong path" });
});

module.exports = router;
