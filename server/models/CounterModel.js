// models/Counter.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // "orderNumber" or "patientId"
  seq: { type: Number, default: 0, required: true },
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

module.exports = Counter;
