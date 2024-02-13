/* eslint-disable no-undef */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  userName: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model('userModal',userSchema);
