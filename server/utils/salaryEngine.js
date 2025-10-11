const Employee = require("../models/employeeModel");
const Salary = require("../models/sallleryModel");
const Leave = require("../models/leaveModel");
const Holiday = require("../models/holidayModel");
const DeductionRule = require("../models/deductionRuleModel");

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function roundTo(value, mode = "nearest") {
  if (mode === "floor") return Math.floor(value);
  if (mode === "ceil") return Math.ceil(value);
  return Math.round(value);
}

// Calculate working days excluding holidays
async function getWorkingDays(year, month) {
  const totalDays = daysInMonth(year, month);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month - 1, totalDays, 23, 59, 59));
  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } }).select("date");
  const holidaysCount = holidays.length;
  const workingDays = totalDays - holidaysCount;
  return { totalDays, holidaysCount, workingDays };
}

// Get approved leaves breakdown, ignoring holidays overlap
async function getLeaveBreakdown(employeeId, year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month - 1, daysInMonth(year, month), 23, 59, 59));

  const leaves = await Leave.find({
    employee: employeeId,
    status: "Approved",
    fromDate: { $lte: end },
    toDate: { $gte: start },
  });
  const holidays = await Holiday.find({ date: { $gte: start, $lte: end } }).select("date");
  const holidaySet = new Set(holidays.map((h) => new Date(h.date).toDateString()));

  const isWeekend = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6; // Sunday(0) or Saturday(6)
  };

  let paid = 0, unpaid = 0, presentDays = 0; // presentDays can be provided externally via attendance; here we infer as workingDays - unpaid

  for (const leave of leaves) {
    const from = new Date(leave.fromDate);
    const to = new Date(leave.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dStr = new Date(d).toDateString();
      if (holidaySet.has(dStr) || isWeekend(d)) continue; // ignore holidays and weekends for leave deduction
      if (d < start || d > end) continue;
      if (leave.leaveType === "Unpaid Leave") unpaid += 1;
      else paid += 1;
    }
  }

  return { paidLeaveDays: paid, unpaidLeaveDays: unpaid };
}

// Apply deduction/earning rules in priority order
function computeRules({ rules, baseValues }) {
  const applied = [];
  let totalEarnings = 0;
  let totalDeductions = 0;
  let taxableIncome = baseValues.gross; // starting taxable base

  const sorted = [...rules].filter((r) => r.active).sort((a, b) => (a.priority || 0) - (b.priority || 0));
  for (const rule of sorted) {
    const baseAmount = baseValues[rule.base] ?? 0;
    const amount = rule.type === "fixed" ? rule.value : (baseAmount * rule.value) / 100;
    applied.push({
      ruleId: rule._id,
      name: rule.name,
      category: rule.category,
      type: rule.type,
      base: rule.base,
      value: rule.value,
      computedAmount: Number(amount.toFixed(2)),
      priority: rule.priority || 0,
    });

    if (rule.category === "earning") {
      totalEarnings += amount;
      if (rule.isTaxable) taxableIncome += amount;
    } else {
      totalDeductions += amount;
      if (rule.isTaxable) taxableIncome -= amount; // if taxable affects income base
    }
  }

  return { applied, totalEarnings, totalDeductions, taxableIncome };
}

// Core salary computation
async function computeMonthlySalary({ employeeId, year, month, rounding = "nearest" }) {
  const emp = await Employee.findById(employeeId).populate("salary");
  if (!emp || !emp.salary) throw new Error("Employee or salary not found");

  const { totalDays, holidaysCount, workingDays } = await getWorkingDays(year, month);
  const { paidLeaveDays, unpaidLeaveDays } = await getLeaveBreakdown(employeeId, year, month);

  const gross = Number(emp.salary.grossSalary || 0);
  const basic = Number(emp.salary.basic || 0);

  // Present days: assume present = workingDays - unpaid leaves - other approved leaves considered paid
  const presentDays = Math.max(workingDays - unpaidLeaveDays, 0);

  // Unpaid rule: Salary = (Gross / WorkingDays) * (WorkingDays - UnpaidLeaves)
  const grossBeforeDeductions = (gross / (workingDays || 1)) * Math.max(workingDays - unpaidLeaveDays, 0);

  // Fetch company rules
  const rules = await DeductionRule.find({});
  const ruleResult = computeRules({
    rules,
    baseValues: {
      gross: grossBeforeDeductions,
      basic,
      net: grossBeforeDeductions, // interim net
      taxable: grossBeforeDeductions, // start taxable as grossBeforeDeductions
    },
  });

  const netPay = Math.max(grossBeforeDeductions + ruleResult.totalEarnings - ruleResult.totalDeductions, 0);

  return {
    workingDays,
    holidaysCount,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    grossBeforeDeductions: Number(grossBeforeDeductions.toFixed(2)),
    totalEarnings: Number(ruleResult.totalEarnings.toFixed(2)),
    totalDeductions: Number(ruleResult.totalDeductions.toFixed(2)),
    taxableIncome: Number(ruleResult.taxableIncome.toFixed(2)),
    netPay: roundTo(netPay, rounding),
    appliedRules: ruleResult.applied,
  };
}

module.exports = { computeMonthlySalary };