const { Users } = require("../../models");

module.exports = {
  async updateUserService(user, body) {
    if (!user || !body)
      throw new Error({ updateUserService: "Missing parameters" });

    const [updated] = await Users.update(body, {
      where: { id: user.id },
      individualHooks: true,
    });

    return updated;
  },
};
