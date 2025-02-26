const router = require("express").Router();
const { googleSignIn } = require("../../controller/firebase-controller");

router.route("/googlesignin").post(googleSignIn);

module.exports = router;
