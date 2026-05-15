const { Xref } = require("../../models");

module.exports = {
  async getSelectedAccountId(userId) {
    const account = await Users.findByPk(userId, {
      attributes: ["selected_account_id"],
      raw: true,
    });
    if (!account) throw new Error("Failed To Retrieve Account Id");

    return account.selected_account_id;
  },
};
