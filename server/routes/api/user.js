const router = require("express").Router();
const {
  createUser,
  login,
  getSingleUser,
  addIncome,
  addExpense,
} = require("../../controller/user-controller");

const { authMiddleware } = require("../../utils/auth");

router.route("/newuser").post(createUser).put(authMiddleware);
router.route("/login").post(login);
router.route("/me").get(authMiddleware, getSingleUser);

router.route("/addincome").put(authMiddleware, addIncome);
router.route("/addexpense").put(authMiddleware, addExpense);

module.exports = router;
