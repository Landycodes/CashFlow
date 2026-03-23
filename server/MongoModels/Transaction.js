const { Schema, model } = require("mongoose");

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
