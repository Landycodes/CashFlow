const User = require("../models/User");
const { signToken } = require("../utils/auth");
const { auth, app } = require("firebase-admin");
const { applicationDefault, initializeApp } = require("firebase-admin/app");

// CHANGE LOGIC TO WORK WITH CARFLOW, STOLEN FROM CARKEEPER
module.exports = {
  async googleSignIn({ body }, res) {
    try {
      //initialize firebase if it doesnt already exist
      if (!app.length) {
        initializeApp({
          credential: applicationDefault(),
          projectId: "cashflow-auth",
        });
      }

      console.log("Authenticating idToken");
      const verifiedIdToken = await auth().verifyIdToken(body.idToken);
      //   console.log(verifiedIdToken);

      if (verifiedIdToken) {
        // find user by email
        const user = await User.findOne({ email: body.email });
        //possibly add another criteria to find user like uid?
        if (user) {
          console.log("account found!");

          const token = signToken(user);
          return res.json({ token, user });
        }

        //If there isnt a user then create one
        if (!user) {
          console.log("creating user!");

          const credentials = {
            username: body.username,
            email: body.email,
            uid: body.uid,
          };

          const newUser = await User.create(credentials);
          const token = signToken(newUser);
          return res.json({ token, newUser });
        }
      } else {
        return res.status(400).json({ ERR: "Token not verified" });
      }

      return;
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  },
  async verifyToken({ body }, res) {
    const token = body;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      res.json({ success: true, user: decodedToken });
    } catch (error) {
      res.status(401).json({ success: false, error: "Invalid token" });
    }
  },
};
