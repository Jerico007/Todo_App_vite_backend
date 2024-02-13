/* eslint-disable no-undef */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    _id: String,
  },
  { strict: false }
);

module.exports = mongoose.model("usersession", sessionSchema);
