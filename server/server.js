const express = require("express");
const routes = require("./routes/index");
const db = require("./config/connection");
require("dotenv").config();
app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

db.once("open", () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
