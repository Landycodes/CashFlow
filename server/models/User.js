const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { fieldEncryption } = require("mongoose-field-encryption");
require("dotenv").config();

const accountSchema = require("./Account");
const billSchema = require("./Bills");
const incomeSchema = require("./Income");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      sparse: true,
    },
    plaidAccessToken: {
      type: String,
    },
    selected_account_id: {
      type: String,
    },
    last_updated: {
      type: Date,
      default: null,
    },
    accounts: [accountSchema],
    bills: [billSchema],
    income: [incomeSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// hash user password
userSchema.pre("save", async function (next) {
  if ((this.isNew && this.password) || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.path("uid").validate((uid) => {
  return uid || this.password;
});

userSchema.plugin(fieldEncryption, {
  fields: ["plaidAccessToken"],
  secret: process.env.MONGOOSE_FIELD_ENCRYPT_KEY,
});

// returns total income
userSchema.virtual("selectedAccount").get(function () {
  if (!this.selected_account_id || !Array.isArray(this.accounts)) {
    return null;
  }
  return (
    this.accounts.find((ac) => ac.account_id === this.selected_account_id) ||
    null
  );
});

const User = model("User", userSchema);

module.exports = User;
