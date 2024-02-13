/* eslint-disable no-undef */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const TodoSchema = new Schema({
  todo: {
    title: {
      type: "String",
      require: true,
    },
    description: {
      type: "String",
      require: true,
    },
    color: {
      type: "String",
    },
    createdAt: {
      type: "Number",
      unique: true,
    },
  },
  userName: {
    type: "String",
    require: true,
  },
});

module.exports = mongoose.model("todo", TodoSchema);
