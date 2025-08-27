const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { fieldEncryption } = require("mongoose-field-encryption");
require("dotenv").config();

const accountSchema = require("./Account");
const incomeSchema = require("./Income");
const expenseSchema = require("./Expense");

// const userSchema = new Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [/.+@.+\..+/, "Must use a valid email address"],
//     },
//     password: {
//       type: String,
//     },
//     uid: {
//       type: String,
//       sparse: true,
//     },
//     plaidAccessToken: {
//       type: String,
//     },
//     accounts: [accountSchema],
//     categories: [],
//     income: [incomeSchema],
//     expense: [expenseSchema],
//     lastUpdated: {
//       type: Date,
//     },
//   },
//   //   set this to use virtual below
//   {
//     toJSON: {
//       virtuals: true,
//     },
//   }
// );

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

// // returns total expense
// userSchema.virtual("Totalexpense").get(function () {
//   let Total = 0;
//   this.expense.forEach((i) => (Total += i.amount));
//   return Total;
// });

// //method for getting income/expense within a range of days
// userSchema.methods.dateRange = function (days) {
//   const currentDate = new Date();
//   let incomeTotal = 0;
//   let expenseTotal = 0;

//   const calculateTotal = (arr) => {
//     return arr.reduce((total, item) => {
//       const itemDate = new Date(item.date); // ISO string → Date
//       const dayDifference = (currentDate - itemDate) / (1000 * 60 * 60 * 24);
//       if (dayDifference <= days) {
//         const amount = parseFloat(item.amount.toString()); // convert Decimal128 to number
//         return total + amount;
//       }
//       return total;
//     }, 0);
//   };

//   incomeTotal = calculateTotal(this.income).toFixed(2);
//   expenseTotal = calculateTotal(this.expense).toFixed(2);
//   return { income: incomeTotal, expense: expenseTotal };
// };

// // return income in the last 7 days from today
// userSchema.virtual("oneWeek").get(function () {
//   return this.dateRange(7);
// });
// // return income in the last 14 days from today
// userSchema.virtual("twoWeek").get(function () {
//   return this.dateRange(14);
// });
// // return income in the last 30 days from today
// userSchema.virtual("oneMonth").get(function () {
//   return this.dateRange(30);
// });
// // return income in the last 90 days from today
// userSchema.virtual("threeMonth").get(function () {
//   return this.dateRange(90);
// });
// // return income in the last 180 days from today
// userSchema.virtual("sixMonth").get(function () {
//   return this.dateRange(180);
// });
// // return income in the last 365 days from today
// userSchema.virtual("oneYear").get(function () {
//   return this.dateRange(365);
// });

const User = model("User", userSchema);

module.exports = User;
