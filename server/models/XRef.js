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
    plaid_entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    default_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    given_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "xref",
  },
);

module.exports = XRef;
