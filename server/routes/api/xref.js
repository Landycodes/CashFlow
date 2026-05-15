const router = require("express").Router();
const { setXrefName } = require("../../controller/crossRef-controller");
const { authMiddleware } = require("../../utils/auth");

router.route("/setName").patch(authMiddleware, setXrefName);

module.exports = router;
