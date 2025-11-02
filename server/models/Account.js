const { Schema, model } = require("mongoose");
const billSchema = require("./Bills");

const accountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    account_id: {
      type: String,
      required: true,
    },
    available_balance: {
      type: Number,
      required: true,
    },
    bills: {
      type: [billSchema],
    },
  },
  { _id: true }
);

module.exports = accountSchema;
