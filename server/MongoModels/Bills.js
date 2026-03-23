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
      type: Date,
      default: null,
    },
    frequency: {
      type: String,
      default: "MONTHLY",
    },
    charged_to: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

module.exports = billSchema;
