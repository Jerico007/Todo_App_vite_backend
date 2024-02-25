const mongoose = require("mongoose");

const { Schema } = mongoose;

const accessSchema = new Schema({
  userId: {
    type: "String",
    require: true,
  },
  time: {
    type: "String",
    require: true,
  },
});

module.exports = mongoose.model("access",accessSchema);