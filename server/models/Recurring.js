const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const Recurring = sequelize.define(
  "Recurring",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "accounts",
        key: "account_id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    last_paid: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM("PAYMENT", "BILL"),
    },
    predicted_next_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    frequency: {
      type: DataTypes.ENUM(
        "UNKNOWN",
        "MONTHLY",
        "WEEKLY",
        "BIWEEKLY",
        "SEMI_MONTHLY",
        "ANNUALLY",
        "QUARTERLY",
      ),
      defaultValue: "MONTHLY",
      allowNull: false,
    },
    transactions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    plaid_stream_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: "recurring",
  },
);

module.exports = Recurring;
