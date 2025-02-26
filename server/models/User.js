const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const incomeSchema = require("./Income");
const expenseSchema = require("./Expense");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
    },
    uid: {
      type: String,
      sparse: true,
    },
    categories: [],
    income: [incomeSchema],
    expense: [expenseSchema],
  },
  //   set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
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

// returns total income
userSchema.virtual("Totalincome").get(function () {
  let Total = 0;
  this.income.forEach((i) => (Total += i.amount));
  return Total;
});

// returns total expense
userSchema.virtual("Totalexpense").get(function () {
  let Total = 0;
  this.expense.forEach((i) => (Total += i.amount));
  return Total;
});

//method for getting income/expense within a range of days
userSchema.methods.dateRange = function (days) {
  const currentDate = new Date();
  let incomeTotal = 0;
  let expenseTotal = 0;

  this.income.forEach((i) => {
    const date = i.date.split("/");
    const month = parseInt(date[0]) - 1;
    const day = parseInt(date[1]);
    const year = parseInt(date[2]) + 2000;
    const createdDate = new Date(year, month, day);
    const timeDifference = currentDate - createdDate;
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
    if (dayDifference <= days) {
      incomeTotal = incomeTotal += i.amount;
    }
  });

  this.expense.forEach((i) => {
    const date = i.date.split("/");
    const month = parseInt(date[0]) - 1;
    const day = parseInt(date[1]);
    const year = parseInt(date[2]) + 2000;
    const createdDate = new Date(year, month, day);
    const timeDifference = currentDate - createdDate;
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
    if (dayDifference <= days) {
      expenseTotal = expenseTotal += i.amount;
    }
  });
  return { income: incomeTotal, expense: expenseTotal };
};

// return income in the last 7 days from today
userSchema.virtual("oneWeek").get(function () {
  return this.dateRange(7);
});
// return income in the last 14 days from today
userSchema.virtual("twoWeek").get(function () {
  return this.dateRange(14);
});
// return income in the last 30 days from today
userSchema.virtual("oneMonth").get(function () {
  return this.dateRange(30);
});
// return income in the last 90 days from today
userSchema.virtual("threeMonth").get(function () {
  return this.dateRange(90);
});
// return income in the last 180 days from today
userSchema.virtual("sixMonth").get(function () {
  return this.dateRange(180);
});
// return income in the last 365 days from today
userSchema.virtual("oneYear").get(function () {
  return this.dateRange(365);
});

const User = model("User", userSchema);

module.exports = User;
