const router = require("express").Router();
const { createUser } = require("../../controller/user-controller");

const { authMiddleware } = require("../../utils/auth");

router.route("/").post(createUser).put(authMiddleware);

module.exports = router;
