const { Schema, model } = require("mongoose");

const billSchema = new Schema(
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
    next_due: {
      type: date,
      default: null,
    },
    frequency: {
      type: String,
      default: "MONTHLY",
    },
  },
  { _id: true }
);

module.exports = billSchema;
