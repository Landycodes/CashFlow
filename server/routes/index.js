const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);
router.get("*", (req, res) => {
  res.json({ Msg: "Whoopsie daisy" });
});

module.exports = router;
