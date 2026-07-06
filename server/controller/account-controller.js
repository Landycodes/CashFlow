const { Users, Transactions, Accounts, sequelize } = require("../models");
const { Op } = require("sequelize");
const { getSelectedAccountId } = require("../controller/services/userService");

module.exports = {
  async createAccount({ user = null, body }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    const { accountName, accountBalance } = body;
    try {
      const newAccount = await Accounts.create({
        user_id: user.id,
        name: accountName,
        available_balance: accountBalance,
      });

      const { id, name, available_balance } = newAccount.toJSON();

      // set new account as selected account to user
      const setSelectedAccountId = await Users.update(
        {
          selected_account_id: id,
        },
        {
          where: { id: user.id },
        },
      );

      res.status(200).json({ id, name, available_balance });
    } catch (error) {
      if (error?.errors?.[0]?.message) {
        return res.status(400).json({ error: error?.errors[0]?.message });
      }
      res.status(500).json({
        createAccount: "Failed to create account",
        errors: error?.errors || error,
      });
    }
  },
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
          [Op.or]: [
            sequelize.where(
              sequelize.cast(sequelize.col("Accounts.id"), "text"),
              accountId,
            ),
            { plaid_account_id: accountId },
          ],
        },
        attributes: [
          "name",
          "available_balance",
          [sequelize.literal("COALESCE(plaid_account_id, id::text)"), "id"],
        ],
        raw: true,
      });

      if (!account && accountId)
        await Users.update(
          {
            selected_account_id: null,
          },
          { where: { id: user.id } },
        );

      if (!account)
        return res.status(404).json({ getAccountData: "No accounts returned" });

      res.status(200).json(account);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ getAccountData: error });
    }
  },
  async deleteAccount({ user = null, body }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    const { id } = body;

    try {
      const deleteCount = await Accounts.destroy({
        where: {
          user_id: user.id,
          id: id,
        },
      });

      if (!deleteCount) return res.status(400).json("Account was not deleted");

      if (deleteCount > 1) {
        console.error(
          `Unexpected: deleted ${deleteCount} rows for account id ${id}`,
        );
        return res
          .status(500)
          .json({ deleteAccount: "Unexpected error deleting account" });
      }

      res.status(200).end();
    } catch (error) {
      res
        .status(500)
        .json({ deleteAccount: "Failed to delete account", error: error });
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
        attributes: [
          "name",
          "available_balance",
          [sequelize.literal("COALESCE(plaid_account_id, id::text)"), "id"],
        ],
        raw: true,
      });

      if (!accounts.length)
        return res
          .status(404)
          .json({ getAllAccounts: "No accounts found for this user" });

      return res.json(accounts);
    } catch (error) {
      res.status(500).json({ getAllAccounts: "Failed to retrieve accounts" });
    }
  },
  async removeAllAccounts({ user = null }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    try {
      const updatedUser = await Users.update(
        {
          lastUpdate: null,
          selected_account_id: null,
          plaidAccessToken: null,
        },
        { where: { id: user.id } },
      );
      if (!updatedUser) throw new Error("removeAccount: Failed to update user");

      const deletedAccounts = await Accounts.destroy({
        where: { user_id: user.id },
      });
      if (!deletedAccounts) {
        throw new Error("removeAccount: Failed to remove accounts");
      }

      res.status(200).end();
    } catch (error) {
      res.status(500).json({ removeAccount: "Failed to update user" });
    }
  },
};
