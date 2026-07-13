const { Users, Transactions, Accounts, sequelize } = require("../models");
const { Op } = require("sequelize");
const { getSelectedAccountId } = require("../controller/services/userService");

module.exports = {
  async createAccount({ user = null, body }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    const { accountName, accountBalance } = body;
    if (!accountName || !accountBalance) res.status(400).end();

    try {
      const newAccount = await Accounts.create({
        user_id: user.id,
        name: accountName,
        available_balance: accountBalance,
      });

      const { id, name, available_balance } = newAccount.toJSON();

      // set users selected account id to the created account
      // formatting solves the return 1 behavior of sequelize
      const [, [updatedUser]] = await Users.update(
        {
          selected_account_id: id,
        },
        {
          where: { id: user.id },
          returning: true,
          raw: true,
        },
      );

      //returns user object to sync context to match DB
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      if (error?.errors?.[0]?.message) {
        return res.status(400).json({ error: error?.errors[0]?.message });
      }
      res.status(500).json({
        createAccount: "Failed to create account",
        // errors: error?.errors || error,
      });
    }
  },
  async getSingleAccount({ user = null }, res) {
    if (!user)
      return res
        .status(404)
        .json({ getSingleAccountData: "Token user not found" });

    try {
      const accountId = await getSelectedAccountId(user.id);

      if (!accountId)
        return res
          .status(404)
          .json({ getSingleAccountData: "Failed to get selected account id" });

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

      if (!account) return res.status(204).end();

      res.status(200).json(account);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ getSingleAccountData: error });
    }
  },
  async deleteAccount({ user = null, body }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    const { id } = body;

    try {
      const currentlySelectedId = await getSelectedAccountId(user.id);

      const result = await sequelize.transaction(async (tx) => {
        const deleteCount = await Accounts.destroy({
          where: {
            user_id: user.id,
            id: id,
          },
          transaction: tx,
        });

        if (!deleteCount)
          return {
            status: 400,
            body: { deleteAccount: "Account was not deleted" },
          };

        if (deleteCount > 1) {
          throw new Error(
            `Unexpected: deleted ${deleteCount} rows for account id ${id}`,
          );
        }

        // Removes ghost id from user.selected_account_id
        if (id === currentlySelectedId) {
          const [, [updatedUser]] = await Users.update(
            {
              lastUpdate: null,
              selected_account_id: null,
              plaid_token: null,
            },
            {
              where: { id: user.id },
              individualHooks: true,
              returning: true,
              raw: true,
              transaction: tx,
            },
          );

          //returns user object to sync context to match DB
          return { status: 200, body: updatedUser };
        }

        return { status: 204 };
      });

      if (result.status !== 204)
        return res.status(result.status).json(result.body);

      return res.status(result.status).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ deleteAccount: "Failed to delete account" });
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
          "id",
          // [sequelize.literal("COALESCE(plaid_account_id, id::text)"), "id"],
        ],
        raw: true,
      });

      if (!accounts.length) return res.status(204).end();

      return res.json(accounts);
    } catch (error) {
      res.status(500).json({ getAllAccounts: "Failed to retrieve accounts" });
    }
  },
  async removeAllAccounts({ user = null }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    try {
      const deletedAccounts = await Accounts.destroy({
        where: { user_id: user.id },
      });
      if (!deletedAccounts) {
        throw new Error("removeAccount: Failed to remove accounts");
      }

      const updatedUser = await Users.update(
        {
          lastUpdate: null,
          selected_account_id: null,
          plaidAccessToken: null,
        },
        { where: { id: user.id } },
      );
      if (!updatedUser) throw new Error("removeAccount: Failed to update user");

      res.status(200).end();
    } catch (error) {
      res.status(500).json({ removeAccount: "Failed to update user" });
    }
  },
};
