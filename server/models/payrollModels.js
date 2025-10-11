const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    status: { type: String, enum: ["draft", "finalized", "reverted"], default: "draft" },
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    holidaysCount: { type: Number, default: 0 },
    grossBeforeDeductions: { type: Number, required: true },
    totalEarnings: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    taxableIncome: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    appliedRules: { type: [mongoose.Schema.Types.Mixed], default: [] },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    logs: [{ message: String, timestamp: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

const payslipSchema = new mongoose.Schema(
  {
    payrollRun: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollRun", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    pdfUrl: { type: String },
    immutable: { type: Boolean, default: true },
    netPay: { type: Number, required: true },
    gross: { type: Number, required: true },
    deductions: { type: Number, required: true },
    remark: { type: String },
    // Snapshot of salary components at the time of payslip generation
    basic: { type: Number },
    hra: { type: Number },
    conveyance: { type: Number },
    specialAllowance: { type: Number },
    mealAllowance: { type: Number },
    grossSalary: { type: Number },
    netSalary: { type: Number },
    currency: { type: String },
  },
  { timestamps: true }
);

const PayrollRun = mongoose.model("PayrollRun", payrollRunSchema);
const Payslip = mongoose.model("Payslip", payslipSchema);

module.exports = { PayrollRun, Payslip };