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
    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "recurring",
  },
);

module.exports = Recurring;
