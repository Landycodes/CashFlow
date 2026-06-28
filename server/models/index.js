const { sequelize } = require("../config/connection");
const Users = require("./Users");
const Accounts = require("./Accounts");
const Transactions = require("./Transactions");
const Recurring = require("./Recurring");
const Xref = require("./XRef");

// Users - has many -> Accounts
Users.hasMany(Accounts, {
  foreignKey: "user_id",
  as: "accounts",
  onDelete: "CASCADE",
});
Accounts.belongsTo(Users, { foreignKey: "user_id" });

// Accounts - has many -> Transactions
Accounts.hasMany(Transactions, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});
Transactions.belongsTo(Accounts, { foreignKey: "account_id" });

// Recurring - has many -> Transactions
Recurring.hasMany(Transactions, {
  foreignKey: "recurring_id",
  onDelete: "SET NULL",
});
Transactions.belongsTo(Recurring, { foreignKey: "recurring_id" });

// Xref - has many -> Transactions
Xref.hasMany(Transactions, {
  foreignKey: "xref_id",
  onDelete: "CASCADE",
});
Transactions.belongsTo(Xref, { foreignKey: "xref_id" });

module.exports = {
  sequelize,
  Users,
  Transactions,
  Accounts,
  Recurring,
  Xref,
};
