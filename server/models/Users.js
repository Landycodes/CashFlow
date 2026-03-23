const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/connection");
const bcrypt = require("bcrypt");

const Users = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // nullable to support uid-only (Firebase) users
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    plaidAccessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      // Encryption handled manually below via hooks instead of mongoose-field-encryption
    },
    selected_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false, // gives you createdAt and updatedAt
    tableName: "users",
    hooks: {
      // replaces userSchema.pre("save", ...)
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.plaidAccessToken) {
          user.plaidAccessToken = encrypt(user.plaidAccessToken);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.changed("plaidAccessToken") && user.plaidAccessToken) {
          user.plaidAccessToken = encrypt(user.plaidAccessToken);
        }
      },
    },
  },
);

// -------------------------------------------
// Replaces mongoose-field-encryption for plaidAccessToken
// -------------------------------------------
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.PASS_ENCRYPT_KEY;
const KEY = crypto.scryptSync(SECRET, "salt", 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(text) {
  if (!text || !text.includes(":")) return text;
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]).toString();
}

// -------------------------------------------
// Instance methods (replaces userSchema.methods)
// -------------------------------------------
Users.prototype.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Replaces the virtual "selectedAccount" — call this instead of accessing a virtual
Users.prototype.getSelectedAccount = async function () {
  if (!this.selected_account_id) return null;
  // Avoids circular require by importing here
  const { Account } = require("./index");
  return Account.findOne({
    where: {
      userId: this.id,
      account_id: this.selected_account_id,
    },
  });
};

// Getter that auto-decrypts plaidAccessToken when you access it
Users.prototype.getPlaidAccessToken = function () {
  return decrypt(this.plaidAccessToken);
};

module.exports = Users;
