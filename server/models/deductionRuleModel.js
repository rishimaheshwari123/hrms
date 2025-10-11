const mongoose = require("mongoose");

const deductionRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // earning or deduction
    category: { type: String, enum: ["earning", "deduction"], required: true },
    // fixed amount or percentage-based
    type: { type: String, enum: ["fixed", "percentage"], required: true },
    // base component to calculate percentage from
    base: { type: String, enum: ["basic", "gross", "net", "taxable"], required: true },
    value: { type: Number, required: true },
    isTaxable: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

const DeductionRule = mongoose.model("DeductionRule", deductionRuleSchema);
module.exports = DeductionRule;