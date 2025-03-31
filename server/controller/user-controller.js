// import user model
const User = require("../models/User");
// import sign token function from auth
const { signToken } = require("../utils/auth");

module.exports = {
  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  async login({ body }, res) {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(401).json({ message: "Can't find this user" });
    }

    if (!user.password) {
      return res
        .status(403)
        .json({ message: "Email exists with anothe sign in method" });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(401).json({ message: "Wrong password!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
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
          .json({ message: "An account with this email already exists." });
      } else if (error.name === "ValidationError") {
        res.status(403).json({ message: "Username and Email are required" });
        console.error(error);
      }
    }
  },

  async updateUser({ body, params }, res) {
    try {
      const id = params.id;
      console.log(body);
      const updatedUser = await User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "Unable to find user" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
};
