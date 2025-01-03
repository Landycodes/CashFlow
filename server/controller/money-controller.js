const User = require("../models/User");

module.exports = {
  async addIncome({ user, body }, res) {
    console.log(user);
    console.log(body);
    try {
      const updatedIncome = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { income: body } },
        { new: true, runValidators: true }
      );

      return res.json(updatedIncome);
    } catch (err) {
      return res.status(400).json(err);
    }
  },
  async addExpense({ user, body }, res) {
    console.log(user);
    console.log(body);
    try {
      const updatedExpense = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { expense: body } },
        { new: true, runValidators: true }
      );

      return res.json(updatedExpense);
    } catch (err) {
      return res.status(400).json(err);
    }
  },
  //delete income by id
  //delete expense by id
  //get income in the last x amount of days
  //get expense in the last x amount of days
  //get income between x and y dates
  //get expenses between x and y dates
  //update income by id
  //update expense by id
};
