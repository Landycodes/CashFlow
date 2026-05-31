const { Types } = require("mongoose");
const { Users, Transactions, Accounts } = require("../models");

const { getSelectedAccountId } = require("../controller/services/userService");

module.exports = {
  async getSingleAccount({ user = null }, res) {
    if (!user)
      return res.status(404).json({ getAccountData: "Token user not found" });

    try {
      const accountId = await getSelectedAccountId(user.id);

      if (!accountId)
        return res
          .status(404)
          .json({ getAccountData: "Failed to get selected account id" });

      const account = await Accounts.findOne({
        where: {
          user_id: user.id,
          account_id: accountId,
        },
        attributes: ["name", "available_balance", "account_id"],
      });

      if (!account)
        return res
          .status(404)
          .json({ getAccountData: "Failed to get account" });

      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({ getAccountData: "Failed to get account Id" });
    }
  },
  async getAllAccounts({ user = null }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    try {
      const accounts = await Accounts.findAll({
        where: {
          user_id: user.id,
        },
        attributes: ["name", "account_id"],
        raw: true,
      });

      if (!accounts)
        return res
          .status(404)
          .json({ getAllAccounts: "No accounts found for this user" });

      return res.json(accounts);
    } catch (error) {
      1;
      res.status(500).json({ getAllAccounts: "Failed to retrieve accounts" });
    }
  },
  async removeAllAccounts({ user = null }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    try {
      const updatedUser = Users.update(
        {
          lastUpdate: null,
          selected_account_id: null,
          plaidAccessToken: null,
        },
        { where: { id: user.id } },
      );
      if (!updatedUser) throw new Error("removeAccount: Failed to update user");

      const deletedAccounts = Accounts.destroy({ where: { user_id: user.id } });
      if (!deletedAccounts) {
        throw new Error("removeAccount: Failed to remove accounts");
      }

      res.status(200).end();
    } catch (error) {
      res.status(500).json({ removeAccount: "Failed to update user" });
    }
  },
};
