const { Payslip, PayrollRun } = require("../models/payrollModels");
const Employee = require("../models/employeeModel");
const { generatePayslipPDFStream } = require("../utils/payslipPdf");

const generatePayslipCtrl = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const { remark } = req.body || {};
    const slip = await Payslip.findById(payslipId);
    if (!slip) return res.status(404).json({ success: false, message: "Payslip not found" });

    const payroll = await PayrollRun.findById(slip.payrollRun);
    const employee = await Employee.findById(slip.employee).populate("salary");

    if (remark) {
      slip.remark = remark;
      await slip.save(); // persist remark on slip for future reference
    }

    // Stream PDF directly to response (on-demand generation, no disk save)
    await generatePayslipPDFStream({ employee, payroll, slip, res });
  } catch (error) {
    console.error("GENERATE PAYSLIP ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

const listPayslipsCtrl = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    const slips = await Payslip.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: slips.length, slips });
  } catch (error) {
    console.error("LIST PAYSLIPS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { generatePayslipCtrl, listPayslipsCtrl };