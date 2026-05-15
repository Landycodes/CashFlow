const { Xref } = require("../models");

module.exports = {
  async setXrefName({ user, body }, res) {
    if (!user) return res.status(400).json({ setXrefName: "Missing user id" });
    const { refData } = body;

    try {
      await Xref.upsert({
        user_id: refData.user_id,
        transaction_id: refData.transaction_id,
        plaid_entity_id: refData.plaid_entity_id,
        default_name: refData.name,
        given_name: refData.xref_name,
      });

      res.status(201).json({ setXrefName: "Reference Name Created!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ setXrefName: "Failed to set cross reference" });
    }
  },
};
