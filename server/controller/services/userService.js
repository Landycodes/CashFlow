const { Users } = require("../../models");

module.exports = {
  // async updateUserService(user, body) {
  //   if (!user || !body)
  //     throw new Error({ updateUserService: "Missing parameters" });

  //   const [updated] = await Users.update(body, {
  //     where: { id: user.id },
  //     individualHooks: true,
  //   });

  //   return updated;
  // },
  async getSelectedAccountId(userId) {
    const account = await Users.findByPk(userId, {
      attributes: ["selected_account_id"],
      raw: true,
    });
    if (!account) throw new Error("Failed To Retrieve Account Id");

    return account.selected_account_id;
  },
};
