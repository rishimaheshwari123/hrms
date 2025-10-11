const mongoose = require("mongoose");

const salaryHistorySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    effectiveFrom: { type: Date, default: Date.now },
    reason: { type: String, default: "Appraisal" },
    appraisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    // Snapshot of salary components
    basic: { type: Number },
    hra: { type: Number },
    allowance: { type: Number },
    conveyance: { type: Number },
    specialAllowance: { type: Number },
    mealAllowance: { type: Number },
    grossSalary: { type: Number },
    netSalary: { type: Number },
    currency: { type: String, default: "INR" },
    remarks: { type: String },
  },
  { timestamps: true }
);

const SalaryHistory = mongoose.model("SalaryHistory", salaryHistorySchema);

module.exports = SalaryHistory;