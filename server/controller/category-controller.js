const User = require("../models/User");

module.exports = {
  async addCategory({ user, body }, res) {
    try {
      const addedCategory = User.findByIdAndUpdate(
        { _id: user._id },
        { $push: { categories: body.category } }
      );
      res.json(addedCategory);
    } catch (err) {
      console.error(err);
    }
  },
};

//add category to array
//remove category from array
