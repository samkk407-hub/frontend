const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  barcode: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ["inactive", "pending", "active", "blocked"],
    default: "inactive"
  },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" }
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  printRates: {
    bw: { type: Number, default: 5 },
    color: { type: Number, default: 15 }
  },
  services: { type: [String], default: ["photocopy", "scan"] },
  openHours: {
    type: String,
    default: ""
  },
  createdAt: { type: Date, default: Date.now }
});

shopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shop", shopSchema);