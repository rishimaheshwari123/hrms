const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    basic: { type: Number, required: true },
    hra: { type: Number },
    allowance: { type: Number },
    grossSalary: { type: Number },
    netSalary: { type: Number },
    currency: { type: String, default: "INR" },
    effectiveFrom: { type: Date, required: true },
    bankDetails: {
      bankName: { type: String },
      branch: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
    },
    taxInfo: {
      panNumber: { type: String },
      pfNumber: { type: String },
      esiNumber: { type: String },
    },
    remarks: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;
