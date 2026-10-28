const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["Stock In", "Stock Out"],
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "StockMovement",
  stockMovementSchema
);