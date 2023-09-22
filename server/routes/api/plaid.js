const router = require("express").Router();
const { create_link_token } = require("../../controller/plaid-controller");

router.route("/create_link_token").post(create_link_token);

module.exports = router;
