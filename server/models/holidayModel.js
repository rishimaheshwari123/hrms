const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    recurring: { type: String, }, // repeats every year
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;