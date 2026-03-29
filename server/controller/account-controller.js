const { Types } = require("mongoose");
const { Users, Transactions, Accounts } = require("../models");
const { updateUserService } = require("../controller/services/userService");
const dayjs = require("dayjs");
const { raw } = require("express");

module.exports = {
  async removeAccount({ user = null }, res) {
    if (!user) res.status(404).json({ removeAccount: "Token user not found" });

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

    // try {
    //   const deletedTransactions = await Transactions.destroy({
    //     where: { user_id: user.id },
    //   });

    //   if (!deletedTransactions) {
    //     res
    //       .status(404)
    //       .json("Did not find any deletable transactions associated with user");
    //   }

    //   res.json(deletedTransactions);
    // } catch (error) {
    //   console.error("Failed to delete transactions", error);
    //   res.status(500);
    // }
  },

  // Grabs list of bills from selected user account and pulls the latest bill from each
  // async getBills({ user = null }, res) {
  //   if (!user) res.status(404).json({ getBills: "Token user not found" });

  //   const account = await User.findById(user._id, "selected_account_id");
  //   const account_id = account.selected_account_id;

  //   try {
  //     const bills = await User.aggregate([
  //       { $match: { _id: new Types.ObjectId(user._id) } },
  //       { $unwind: "$bills" },
  //       { $match: { "bills.charged_to": account_id } },
  //       {
  //         $project: {
  //           _id: 0,
  //           name: "$bills.name",
  //           amount: "$bills.amount",
  //           last_paid: {
  //             $dateToString: {
  //               format: "%m/%d/%Y",
  //               date: "$bills.last_paid",
  //             },
  //           },
  //           next_due: {
  //             $dateToString: {
  //               format: "%m/%d/%Y",
  //               date: "$bills.next_due",
  //             },
  //           },
  //           frequency: "$bills.frequency",
  //           id: "$bills._id",
  //         },
  //       },
  //     ]);

  //     if (bills.length <= 0) return;

  //     res.json(bills);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json(error);
  //   }
  // },
  async addBill({ params, body }, res) {
    const { user_id, account_id } = params;
    const billName = body.billName;

    try {
      const user = await User.updateOne(
        { _id: new Types.ObjectId(user_id), "accounts.account_id": account_id },
        {
          $addToSet: { "accounts.$.bills": billName },
        },
      );

      if (!user.acknowledged) {
        res.status(404).json("Unable to add bill");
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  async deleteBill({ params, body }, res) {
    const { user_id, account_id } = params;
    const billName = body.billName;

    try {
      const user = await User.updateOne(
        { _id: new Types.ObjectId(user_id), "accounts.account_id": account_id },
        {
          $pull: { "accounts.$.bills": billName },
        },
      );

      if (!user.acknowledged) {
        res.status(404).json("Unable to remove bill");
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
};
