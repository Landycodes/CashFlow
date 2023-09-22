const router = require("express").Router();
const userRoutes = require("./user");
const plaidRoutes = require("./plaid");

router.use("/", userRoutes);
router.use("/plaid", plaidRoutes);
router.get("*", (req, res) => {
  res.json({ Msg: "You are on the wrong path" });
});

module.exports = router;
