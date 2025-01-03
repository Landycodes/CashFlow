const router = require("express").Router();
const {
  createUser,
  login,
  getSingleUser,
} = require("../../controller/user-controller");

const { authMiddleware } = require("../../utils/auth");

router.route("/newuser").post(createUser).put(authMiddleware);
router.route("/login").post(login);
router.route("/me").get(authMiddleware, getSingleUser);

module.exports = router;
