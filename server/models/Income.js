const { Schema, model } = require("mongoose");

const incomeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    last_paid: {
      type: Date,
      default: null,
    },
    next_pay: {
      type: Date,
      default: null,
    },
    frequency: {
      type: String,
    },
    deposited_to: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);
module.exports = incomeSchema;
