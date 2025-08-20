const { Schema, model } = require("mongoose");

// const incomeSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   account_id: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: String,
//     required: true,
//   },
//   amount: {
//     type: Mongoose.Decimal128,
//     set: (v) => {
//       const positiveValue = Math.abs(parseFloat(v));
//       return Mongoose.Types.Decimal128.fromString(positiveValue.toFixed(2));
//     },
//     required: true,
//   },
//   category: {
//     type: String,
//   },
// });

const transactionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account_id: {
    type: String,
    ref: "Account",
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
  },
});

module.exports = model("Transaction", transactionSchema);
