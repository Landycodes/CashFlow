const User = require("../models/Users");
const { Op } = require("sequelize");
const { signToken } = require("../utils/auth");

module.exports = {
  // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
  // {body} is destructured req.body
  async login({ body }, res) {
    const user = await User.findOne({ where: { email: body.email } });
    if (!user) {
      return res.status(404).json({ message: "Can't find this user" });
    }

    if (!user.password) {
      return res
        .status(403)
        .json({ message: "Email exists with another sign in method" });
    }

    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      return res.status(401).json({ message: "Wrong password!" });
    }
    const token = signToken(user);
    res.json({ token, user });
  },
  async getSingleUser({ user = null, params }, res) {
    if (!user) return res.status(404).json({ message: "Invalid Web Token" });

    const foundUser = await User.findByPk(user.id);

    // const foundUser = await User.findOne({
    //   where: {
    //     [Op.or]: [
    //       {
    //         id: {
    //           [Op.eq]: user ? user.id : params.id,
    //         },
    //       },
    //       {
    //         username: {
    //           [Op.eq]: params.username?.trim(),
    //         },
    //       },
    //     ],
    //   },
    // });

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
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ message: "An account with this email already exists." });
      } else if (error.name === "SequelizeValidationError") {
        res.status(403).json({ message: "Username and Email are required" });
        console.error(error);
      }
    }
  },

  async updateUser({ user = null, body }, res) {
    // console.log(user);
    if (!user) return res.status(400).json({ message: "Invalid Web Token" });

    try {
      const [updated] = await User.update(body, {
        where: { id: user.id },
        individualHooks: true,
      });

      if (!updated) {
        return res.status(404).json({ message: "Unable to update user" });
      }

      const updatedUser = await User.findByPk(user.id);
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  },
};
