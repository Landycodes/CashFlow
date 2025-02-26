const express = require("express");
const routes = require("./routes/index");
const db = require("./config/connection");
require("dotenv").config();
const fireBaseAdmin = require("firebase-admin");
app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

if (!fireBaseAdmin.apps.length) {
  fireBaseAdmin.initializeApp({
    credential: fireBaseAdmin.credential.cert({
      projectId: process.env.FB_ADMIN_PROJECT_ID,
      privateKey: process.env.FB_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
    }),
  });
}
db.once("open", () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
