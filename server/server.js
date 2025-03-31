const express = require("express");
const https = require("https");
const fs = require("fs");
const routes = require("./routes/index");
const db = require("./config/connection");
require("dotenv").config();
const fireBaseAdmin = require("firebase-admin");
app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.use(
  cors({
    origin: "https://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

if (!fireBaseAdmin.apps.length) {
  fireBaseAdmin.initializeApp({
    credential: fireBaseAdmin.credential.cert({
      projectId: process.env.FB_ADMIN_PROJECT_ID,
      privateKey: process.env.FB_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
    }),
  });
}

const options = {
  key: fs.readFileSync("C:/Program Files/OpenSSL-Win64/bin/private.key"),
  cert: fs.readFileSync("C:/Program Files/OpenSSL-Win64/bin/certificate.crt"),
};

db.once("open", () => {
  // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  https.createServer(options, app).listen(PORT, () => {
    console.log(`🚀 HTTPS Server running on https://localhost:${PORT}`);
  });
});
