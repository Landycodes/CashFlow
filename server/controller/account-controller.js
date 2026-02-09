const { Types } = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const dayjs = require("dayjs");

module.exports = {
  // Grabs list of bills from selected user account and pulls the latest bill from each
  async getBills({ user = null }, res) {
    if (!user) res.status(404).json({ getBills: "Token user not found" });

    const account = await User.findById(user._id, "selected_account_id");
    const account_id = account.selected_account_id;

    try {
      const bills = await User.aggregate([
        { $match: { _id: new Types.ObjectId(user._id) } },
        { $unwind: "$bills" },
        { $match: { "bills.charged_to": account_id } },
        {
          $project: {
            _id: 0,
            name: "$bills.name",
            amount: "$bills.amount",
            last_paid: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$bills.last_paid",
              },
            },
            next_due: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$bills.next_due",
              },
            },
            frequency: "$bills.frequency",
            id: "$bills._id",
          },
        },
      ]);

      if (bills.length <= 0) return;

      // const billNames = accountBills.map((b) => b.name);

      // // console.log(billNames);

      // const bills = await Transaction.aggregate([
      //   {
      //     $match: {
      //       user_id: new Types.ObjectId(user._id),
      //       account_id: account_id,
      //       name: { $in: billNames },
      //     },
      //   },
      //   { $sort: { date: -1 } },
      //   {
      //     $group: {
      //       _id: "$name",
      //       latest: { $first: "$$ROOT" },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       name: "$_id",
      //       amount: "$latest.amount",
      //       last_paid: {
      //         $dateToString: {
      //           format: "%m/%d/%Y",
      //           date: "$latest.date",
      //         },
      //       },
      //       next_due: {
      //         $dateToString: {
      //           format: "%m/%d/%Y",
      //           date: "$latest.date",
      //         },
      //       },
      //     },
      //   },
      //   { $sort: { amount: -1 } },
      // ]);

      // console.log(bills);

      res.json(bills);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  },
  async addBill({ params, body }, res) {
    const { user_id, account_id } = params;
    const billName = body.billName;

    try {
      const user = await User.updateOne(
        { _id: new Types.ObjectId(user_id), "accounts.account_id": account_id },
        {
          $addToSet: { "accounts.$.bills": billName },
        }
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
        }
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
