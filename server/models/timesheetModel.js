const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    task: { type: String, required: true },
    hours: { type: Number, required: true, min: 0 },
    billable: { type: Boolean, default: false },
  },
  { _id: false }
);

const timesheetSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    weekStart: { type: Date, required: true },
    entries: { type: [entrySchema], default: [] },
    status: { type: String, enum: ["Draft", "Submitted", "Approved", "Rejected"], default: "Submitted" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approvedAt: { type: Date },
    remarks: { type: String },
    totalHours: { type: Number, default: 0 },
    totalBillableHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

timesheetSchema.index({ employee: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("Timesheet", timesheetSchema);