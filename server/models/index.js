const { sequelize } = require("../config/connection");
const Users = require("./Users");
const Accounts = require("./Accounts");
const Transactions = require("./Transactions");
const Recurring = require("./Recurring");

// Users <-> Accounts
Users.hasMany(Accounts, {
  foreignKey: "user_id",
  as: "accounts",
  onDelete: "CASCADE",
});
Accounts.belongsTo(Users, { foreignKey: "user_id" });

// Accounts <-> Transactions
Accounts.hasMany(Transactions, { foreignKey: "user_id", onDelete: "CASCADE" });
Transactions.belongsTo(Accounts, { foreignKey: "user_id" });

// Transactions <-> Recurring
Transactions.hasMany(Recurring, {
  foreignKey: "account_id",
  onDelete: "CASCADE",
});
Recurring.belongsTo(Transactions, { foreignKey: "account_id" });

module.exports = {
  sequelize,
  Users,
  Transactions,
  Accounts,
  Recurring,
};
