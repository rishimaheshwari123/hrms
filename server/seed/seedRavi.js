const Employee = require("../models/employeeModel");
const Salary = require("../models/sallleryModel");
const { PayrollRun, Payslip } = require("../models/payrollModels");
const DeductionRule = require("../models/deductionRuleModel");
const Holiday = require("../models/holidayModel");
const { computeMonthlySalary } = require("../utils/salaryEngine");
const bcrypt = require("bcryptjs");

async function ensureEmployee() {
  let emp = await Employee.findOne({ email: "ravi.kumar@example.com" });
  if (!emp) {
    const hashed = await bcrypt.hash("Employee@123", 10);
    emp = await Employee.create({
      firstName: "Ravi",
      lastName: "Kumar",
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      password: hashed,
      role: "employee",
      employeeCode: "EMP-1001",
      department: "Finance",
      dateOfJoining: new Date(Date.UTC(2025, 2, 15)), // 15 Mar 2025
      isActive: true,
      employmentStatus: "Active",
    });
  } else {
    // Always reset dev password to known default for predictable login
    emp.password = await bcrypt.hash("Employee@123", 10);
    emp.isActive = true;
    emp.employmentStatus = "Active";
    await emp.save();
  }
  return emp;
}

async function ensureAdmin() {
  // Seed a default admin for development login
  let admin = await Employee.findOne({ email: "admin@hrms.local" });
  if (!admin) {
    const hashed = await bcrypt.hash("Admin@123", 10);
    admin = await Employee.create({
      firstName: "System",
      lastName: "Admin",
      name: "System Admin",
      email: "admin@hrms.local",
      password: hashed,
      role: "admin",
      isActive: true,
      employmentStatus: "Active",
    });
  }
  return admin;
}

async function ensureSalary(empId) {
  let sal = await Salary.findOne({ employee: empId });
  if (!sal) {
    sal = await Salary.create({
      employee: empId,
      basic: 30000,
      hra: 12000,
      allowance: 5000,
      grossSalary: 47000,
      netSalary: 47000,
      currency: "INR",
    });
    // Link salary to employee for populate()
    await Employee.findByIdAndUpdate(empId, { salary: sal._id });
  } else {
    // Ensure employee.salary is linked even if salary existed
    await Employee.findByIdAndUpdate(empId, { salary: sal._id });
  }
  return sal;
}

async function ensureRules() {
  const existing = await DeductionRule.find({});
  if (existing.length === 0) {
    await DeductionRule.insertMany([
      { name: "PF (Employee)", category: "deduction", type: "percentage", base: "basic", value: 12, isTaxable: false, priority: 1 },
      { name: "Professional Tax", category: "deduction", type: "fixed", base: "gross", value: 200, isTaxable: false, priority: 2 },
      { name: "Health Insurance", category: "deduction", type: "fixed", base: "gross", value: 300, isTaxable: false, priority: 3 },
      { name: "Income Tax", category: "deduction", type: "percentage", base: "taxable", value: 5, isTaxable: true, priority: 4 },
    ]);
  }
}

async function seedHolidays() {
  // Jan 26, Aug 15, Diwali sample - within 2025
  const holidays = [
    { title: "Republic Day", date: new Date(Date.UTC(2025, 0, 26)) },
    { title: "Independence Day", date: new Date(Date.UTC(2025, 7, 15)) },
    { title: "Diwali", date: new Date(Date.UTC(2025, 10, 1)) },
    { title: "Company Holiday Jan", date: new Date(Date.UTC(2025, 0, 5)) },
    { title: "Company Holiday Feb", date: new Date(Date.UTC(2025, 1, 10)) },
  ];
  for (const h of holidays) {
    const exists = await Holiday.findOne({ title: h.title, date: h.date });
    if (!exists) await Holiday.create(h);
  }
}

async function runSeedPayroll(emp) {
  // Attendance as per sample
  const samples = [
    { month: 1, year: 2025, presentDays: 29, unpaidLeaveDays: 0 },
    { month: 2, year: 2025, presentDays: 25, unpaidLeaveDays: 2 },
    { month: 3, year: 2025, presentDays: 15, unpaidLeaveDays: 0 },
  ];

  for (const s of samples) {
    // compute using engine (engine derives present from unpaid leaves, but we can trust engine)
    const summary = await computeMonthlySalary({ employeeId: emp._id, year: s.year, month: s.month });
    const existing = await PayrollRun.findOne({ employee: emp._id, month: s.month, year: s.year });
    if (existing) continue;
    const pr = await PayrollRun.create({
      employee: emp._id,
      month: s.month,
      year: s.year,
      status: "finalized",
      workingDays: summary.workingDays,
      presentDays: summary.presentDays,
      paidLeaveDays: summary.paidLeaveDays,
      unpaidLeaveDays: summary.unpaidLeaveDays,
      holidaysCount: summary.holidaysCount,
      grossBeforeDeductions: summary.grossBeforeDeductions,
      totalEarnings: summary.totalEarnings,
      totalDeductions: summary.totalDeductions,
      taxableIncome: summary.taxableIncome,
      netPay: summary.netPay,
      appliedRules: summary.appliedRules,
      logs: [{ message: "Seed payroll finalized", timestamp: new Date() }],
    });
    await Payslip.create({ payrollRun: pr._id, employee: emp._id, month: s.month, year: s.year, netPay: pr.netPay, gross: pr.grossBeforeDeductions, deductions: pr.totalDeductions });
  }
}

async function seed() {
  const emp = await ensureEmployee();
  await ensureSalary(emp._id);
  await ensureRules();
  await seedHolidays();
  await runSeedPayroll(emp);
  await ensureAdmin();
  console.log("Seed completed for Ravi Kumar and Admin user");
}

module.exports = { seed };