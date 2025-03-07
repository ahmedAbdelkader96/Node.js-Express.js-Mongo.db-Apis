const mongoose = require("mongoose");
const constants = require("../configs/constants");

const userSchema = mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: constants.emailRegex,
    },
    password: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema, "users");
