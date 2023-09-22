const { Schema } = require("mongoose");

const incomeSchema = new Schema({
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

module.exports = incomeSchema;
