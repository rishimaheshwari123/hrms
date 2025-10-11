const { computeMonthlySalary } = require("../utils/salaryEngine");
const { PayrollRun, Payslip } = require("../models/payrollModels");
const Employee = require("../models/employeeModel");

// Run payroll for one employee and month
const runPayrollCtrl = async (req, res) => {
  try {
    const { employeeId, month, year, processedBy, rounding } = req.body;
    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: "employeeId, month, year required" });
    }

    const employee = await Employee.findById(employeeId).populate("salary");
    if (!employee || !employee.salary) {
      return res.status(404).json({ success: false, message: "Employee or salary not found" });
    }

    // Prevent double payroll for same month
    const existing = await PayrollRun.findOne({ employee: employeeId, month, year, status: { $in: ["draft", "finalized"] } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Payroll already processed for this month" });
    }

    const summary = await computeMonthlySalary({ employeeId, year, month, rounding });

    const pr = await PayrollRun.create({
      employee: employeeId,
      month,
      year,
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
      processedBy,
      logs: [{ message: "Payroll finalized", timestamp: new Date() }],
    });

    // Create payslip (PDF generation will be a separate step for URL)
    const sal = employee.salary || {};
    const slip = await Payslip.create({
      payrollRun: pr._id,
      employee: employeeId,
      month,
      year,
      netPay: pr.netPay,
      gross: pr.grossBeforeDeductions,
      deductions: pr.totalDeductions,
      // snapshot fields
      basic: Number(sal.basic || 0),
      hra: Number(sal.hra || 0),
      conveyance: Number(sal.conveyance || 0),
      specialAllowance: Number(sal.specialAllowance || sal.allowance || 0),
      mealAllowance: Number(sal.mealAllowance || 0),
      grossSalary: Number(sal.grossSalary || 0),
      netSalary: Number(sal.netSalary || pr.netPay || 0),
      currency: sal.currency || "INR",
    });

    return res.status(201).json({ success: true, data: { payroll: pr, payslip: slip } });
  } catch (error) {
    console.error("RUN PAYROLL ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get payroll summary
const getPayrollCtrl = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    const data = await PayrollRun.find(query).populate("employee", "name employeeCode department");
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET PAYROLL ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete payroll and payslips for employee/month/year
const deletePayrollCtrl = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: "employeeId, month, year required" });
    }

    const query = { employee: employeeId, month: Number(month), year: Number(year) };
    const existing = await PayrollRun.find(query);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "No payroll found for specified employee and month" });
    }

    // Delete associated payslips first
    await Payslip.deleteMany({ employee: employeeId, month: Number(month), year: Number(year) });
    // Then delete payroll runs
    await PayrollRun.deleteMany(query);

    return res.status(200).json({ success: true, message: "Deleted payroll and payslips for specified employee and month" });
  } catch (error) {
    console.error("DELETE PAYROLL ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { runPayrollCtrl, getPayrollCtrl, deletePayrollCtrl };