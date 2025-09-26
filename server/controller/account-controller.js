const { Types } = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

module.exports = {
  async getBills({ params }, res) {
    const { user_id, account_id } = params;

    try {
      const user = await User.findOne(
        { _id: user_id, "accounts.account_id": account_id },
        { "accounts.$": 1 }
      );

      console.log(user);
      const billNames = user.accounts[0].bills;
      console.log(billNames);

      const bills = await Transaction.find({
        user_id: new Types.ObjectId(user_id),
        account_id: account_id,
        name: { $in: billNames },
      });

      console.log(bills);

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
