const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Transactions = sequelize.define(
  "Transactions",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
    },
    recurring_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "recurring",
        key: "id",
      },
    },
    xref_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "xref",
        key: "id",
      },
    },
    plaid_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plaid_transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    plaid_entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("INCOME", "EXPENSE"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "transactions",
  },
);

module.exports = Transactions;
