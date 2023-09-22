const { Schema, model } = require("mongoose");

const expenseSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = expenseSchema;
