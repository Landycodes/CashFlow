const router = require("express").Router();
const userRoutes = require("./user");

router.use("/users", userRoutes);
router.get("*", (req, res) => {
  res.json({ Msg: "You are on the wrong path" });
});

module.exports = router;
