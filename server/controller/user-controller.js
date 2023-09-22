// import user model
const User = require("../models/User");
// import sign token function from auth
const { signToken } = require("../utils/auth");

module.exports = {
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      $or: [
        { _id: user ? user._id : params.id },
        { username: params.username },
      ],
    });

    if (!foundUser) {
      return res
        .status(400)
        .json({ message: "Cannot find a user with this id!" });
    }

    res.json(foundUser);
  },
  async login({ body }, res) {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(400).json({ message: "Wrong password!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },

  async createUser({ body }, res) {
    try {
      const user = await User.create(body);

      if (!user) {
        return res.status(400).json({ message: "Something is wrong!" });
      }
      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ ERROR: "An account with this email already exists." });
      } else if (error.name === "ValidationError") {
        res.status(403).json({ ERROR: "Username and Email are required" });
        console.error(error);
      }
    }
  },
  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  async login({ body }, res) {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(400).json({ message: "Wrong password!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },

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
};
