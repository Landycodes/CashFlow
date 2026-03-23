const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");

const XRef = sequelize.define(
  "XRef",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "transactions",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    defaultName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    givenName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "xref",
  },
);

module.exports = XRef;
