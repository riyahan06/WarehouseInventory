const mongoose = require("mongoose");

const dispatchSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    destination: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: "Dispatched"
    },

    date: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model("Dispatch", dispatchSchema);