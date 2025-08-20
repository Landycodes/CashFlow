const { Schema, model } = require("mongoose");

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
  },
  { _id: true }
);

module.exports = accountSchema;
