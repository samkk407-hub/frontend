const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  documentUrl: { type: String },
  documentPublicId: { type: String },
  pages: { type: Number, required: true, min: 1 },
  printType: {
    type: String,
    enum: ["portrait", "landscape"],
    default: "portrait"
  },
  colorMode: {
    type: String,
    enum: ["color", "bw"],
    default: "bw"
  },
  paymentMethod: {
    type: String,
    enum: ["cash"],
    default: "cash"
  },
  mobileOtp: { type: String },
  printReleaseOtp: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
