// const Mongoose = require("mongoose");
// const { Schema } = Mongoose;

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

// module.exports = incomeSchema;
