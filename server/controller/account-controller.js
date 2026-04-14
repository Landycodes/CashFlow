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
  async removeAccount({ user = null }, res) {
    if (!user)
      return res.status(404).json({ removeAccount: "Token user not found" });

    try {
      const updatedUser = Users.update(
        {
          lastUpdate: "",
          selected_account_id: "",
          plaidAccessToken: "",
        },
        { where: { user_id: user.id } },
      );
      if (!updatedUser) throw new Error("removeAccount: Failed to update user");

      const deletedAccounts = Accounts.destroy({ where: { user_id: user.id } });
      if (!deletedAccounts)
        throw new Error("removeAccount: Failed to remove accounts");
    } catch (error) {
      res.status(500).json({ removeAccount: "Failed to update user" });
    }
  },

  // async addBill({ params, body }, res) {
  //   const { user_id, account_id } = params;
  //   const billName = body.billName;

  //   try {
  //     const user = await User.updateOne(
  //       { _id: new Types.ObjectId(user_id), "accounts.account_id": account_id },
  //       {
  //         $addToSet: { "accounts.$.bills": billName },
  //       },
  //     );

  //     if (!user.acknowledged) {
  //       res.status(404).json("Unable to add bill");
  //     }

  //     res.json(user);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json(error);
  //   }
  // },
  // async deleteBill({ params, body }, res) {
  //   const { user_id, account_id } = params;
  //   const billName = body.billName;

  //   try {
  //     const user = await User.updateOne(
  //       { _id: new Types.ObjectId(user_id), "accounts.account_id": account_id },
  //       {
  //         $pull: { "accounts.$.bills": billName },
  //       },
  //     );

  //     if (!user.acknowledged) {
  //       res.status(404).json("Unable to remove bill");
  //     }

  //     res.json(user);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json(error);
  //   }
  // },
};
