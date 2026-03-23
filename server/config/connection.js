const { Sequelize } = require("sequelize");
require("dotenv").config({ path: "../.env" });

const sequelize = new Sequelize(
  process.env.PGDB_NAME,
  process.env.PGDB_USER,
  process.env.PGDB_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
    port: 5432,
    logging: false,
  },
);

module.exports = { sequelize };
