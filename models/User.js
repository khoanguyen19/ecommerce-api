const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    img: { type: String },
    isAdmin: { type: Boolean, default: false },
    gender: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
