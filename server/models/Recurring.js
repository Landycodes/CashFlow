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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    last_paid: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM("PAYMENT", "BILL"),
    },
    predicted_next_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    frequency: {
      type: DataTypes.ENUM(
        "MONTHLY",
        "WEEKLY",
        "BIWEEKLY",
        "SEMIMONTHLY",
        "YEARLY",
        "QUARTERLY",
      ),
      defaultValue: "MONTHLY",
      allowNull: false,
    },
    charged_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "recurring",
  },
);

module.exports = Recurring;
