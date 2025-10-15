const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure only one entry per employee per calendar day
timesheetSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Timesheet", timesheetSchema);