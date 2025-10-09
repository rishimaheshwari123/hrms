const mongoose = require("mongoose");

const approvalStepSchema = new mongoose.Schema(
  {
    stepOrder: { type: Number, required: true },
    role: { type: String, enum: ["manager", "hr", "admin"], required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    remarks: { type: String },
    timestamp: { type: Date },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { _id: false }
);

const accrualEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ["credit", "debit", "carryover"], required: true },
    days: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String },
  },
  { _id: false }
);

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveType: {
      type: String,
      enum: ["Casual Leave", "Sick Leave", "Paid Leave", "Maternity Leave", "Unpaid Leave"],
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    accrualHistory: [accrualEntrySchema],
    approvalSteps: [approvalStepSchema],
    approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    currentStep: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;
