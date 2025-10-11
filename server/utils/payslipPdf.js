const fs = require("fs");
const path = require("path");
let PDFDocument;
try {
  PDFDocument = require("pdfkit");
} catch (e) {
  // If pdfkit not installed yet, we'll throw meaningful error at runtime
}

async function generatePayslipPDF({ employee, payroll, slip }) {
  if (!PDFDocument) throw new Error("PDFKit not installed. Please install pdfkit");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const outDir = path.join(__dirname, "..", "payslips");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const filename = `payslip_${employee.employeeCode || employee._id}_${slip.year}_${slip.month}.pdf`;
  const filePath = path.join(outDir, filename);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(18).text("Company Name", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).text("Payslip", { align: "center" });
  if (slip.remark) {
    doc.moveDown(0.25);
    doc.fontSize(9).fillColor("#333").text(`Remark: ${slip.remark}`, { align: "center" });
    doc.fillColor("#000");
  }
  doc.moveDown();

  // Employee Details
  doc.fontSize(10);
  doc.text(`Employee: ${employee.name}`);
  doc.text(`Employee ID: ${employee.employeeCode || employee._id}`);
  doc.text(`Department: ${employee.department || '-'}`);
  doc.text(`Pay Period: ${slip.month}-${slip.year}`);
  doc.moveDown();

  // Base Earnings from snapshot
  const salSnap = {
    basic: slip.basic,
    hra: slip.hra,
    conveyance: slip.conveyance,
    specialAllowance: slip.specialAllowance,
    mealAllowance: slip.mealAllowance,
    currency: slip.currency || (employee.salary && employee.salary.currency) || "INR",
  };
  const baseEarnings = [
    { label: "BASIC", amount: Number(salSnap.basic || 0) },
    { label: "HRA", amount: Number(salSnap.hra || 0) },
    { label: "CONVEYANCE", amount: Number(salSnap.conveyance || 0) },
    { label: "SPECIAL ALLOWANCE", amount: Number(salSnap.specialAllowance || 0) },
    { label: "MEAL ALLOWANCE", amount: Number(salSnap.mealAllowance || 0) },
  ];
  const baseTotal = baseEarnings.reduce((sum, i) => sum + (isNaN(i.amount) ? 0 : i.amount), 0);

  doc.fontSize(11).text("BASE EARNINGS", { underline: true });
  baseEarnings.forEach((item, idx) => {
    doc.text(`${idx + 1}. ${item.label} - ₹${item.amount}`);
  });
  doc.text(`(A) EARNINGS TOTAL: ₹${baseTotal}`);
  doc.moveDown(0.5);

  // Gross (pre-deductions)
  doc.text(`Adjusted Gross before rules (attendance applied): ₹${payroll.grossBeforeDeductions}`);
  doc.moveDown(0.5);

  // Earning Rules
  const earningRules = payroll.appliedRules.filter((r) => r.category === "earning");
  if (earningRules.length) {
    doc.fontSize(11).text("EARNING RULES", { underline: true });
    earningRules.forEach((r, idx) => {
      doc.text(`${idx + 1}. ${r.name} (${r.type} of ${r.base}) - ₹${r.computedAmount}`);
    });
    doc.text(`Total from Earning Rules: ₹${payroll.totalEarnings}`);
    doc.moveDown(0.5);
  }

  // Deductions
  doc.fontSize(11).text("DEDUCTIONS", { underline: true });
  const deductions = payroll.appliedRules.filter((r) => r.category === "deduction");
  deductions.forEach((r, idx) => {
    doc.text(`${idx + 1}. ${r.name} (${r.type} of ${r.base}) - ₹${r.computedAmount}`);
  });
  doc.text(`(B) DEDUCTIONS TOTAL: ₹${payroll.totalDeductions}`);
  doc.moveDown(0.5);

  // Net Pay
  doc.fontSize(12).text(`NET PAYABLE: ₹${payroll.netPay}`, { underline: true });
  doc.moveDown();
  doc.text(`Working Days: ${payroll.workingDays}`);
  doc.text(`Holidays: ${payroll.holidaysCount}`);
  doc.text(`Present Days: ${payroll.presentDays}`);
  doc.text(`Paid Leaves: ${payroll.paidLeaveDays}`);
  doc.text(`Unpaid Leaves (LOP): ${payroll.unpaidLeaveDays}`);

  doc.moveDown();
  doc.text("Applied Rules:");
  payroll.appliedRules.forEach((r) => {
    doc.text(`- ${r.name} (${r.category}, ${r.type} of ${r.base}): ₹${r.computedAmount}`);
  });

  doc.moveDown(2);
  if (slip.remark) {
    doc.fontSize(9).fillColor("#333").text(`Note: ${slip.remark}`);
    doc.fillColor("#000");
    doc.moveDown(1);
  }
  doc.text("Authorized Signature", { align: "right" });

  doc.end();

  await new Promise((resolve) => stream.on("finish", resolve));
  return filePath;
}
async function generatePayslipPDFStream({ employee, payroll, slip, res }) {
  if (!PDFDocument) throw new Error("PDFKit not installed. Please install pdfkit");
  const filename = `payslip_${employee.employeeCode || employee._id}_${slip.year}_${slip.month}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  // Header
  doc.fontSize(18).text("Company Name", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).text("Payslip", { align: "center" });
  if (slip.remark) {
    doc.moveDown(0.25);
    doc.fontSize(9).fillColor("#333").text(`Remark: ${slip.remark}`, { align: "center" });
    doc.fillColor("#000");
  }
  doc.moveDown();

  // Employee Details
  doc.fontSize(10);
  doc.text(`Employee: ${employee.name}`);
  doc.text(`Employee ID: ${employee.employeeCode || employee._id}`);
  doc.text(`Department: ${employee.department || '-'}`);
  doc.text(`Pay Period: ${slip.month}-${slip.year}`);
  doc.moveDown();

  // Base Earnings from snapshot
  const salSnap = {
    basic: slip.basic,
    hra: slip.hra,
    conveyance: slip.conveyance,
    specialAllowance: slip.specialAllowance,
    mealAllowance: slip.mealAllowance,
    currency: slip.currency || (employee.salary && employee.salary.currency) || "INR",
  };
  const baseEarnings = [
    { label: "BASIC", amount: Number(salSnap.basic || 0) },
    { label: "HRA", amount: Number(salSnap.hra || 0) },
    { label: "CONVEYANCE", amount: Number(salSnap.conveyance || 0) },
    { label: "SPECIAL ALLOWANCE", amount: Number(salSnap.specialAllowance || 0) },
    { label: "MEAL ALLOWANCE", amount: Number(salSnap.mealAllowance || 0) },
  ];
  const baseTotal = baseEarnings.reduce((sum, i) => sum + (isNaN(i.amount) ? 0 : i.amount), 0);

  doc.fontSize(11).text("BASE EARNINGS", { underline: true });
  baseEarnings.forEach((item, idx) => {
    doc.text(`${idx + 1}. ${item.label} - ₹${item.amount}`);
  });
  doc.text(`(A) EARNINGS TOTAL: ₹${baseTotal}`);
  doc.moveDown(0.5);

  // Gross (pre-deductions)
  doc.text(`Adjusted Gross before rules (attendance applied): ₹${payroll.grossBeforeDeductions}`);
  doc.moveDown(0.5);

  // Earning Rules
  const earningRules = payroll.appliedRules.filter((r) => r.category === "earning");
  if (earningRules.length) {
    doc.fontSize(11).text("EARNING RULES", { underline: true });
    earningRules.forEach((r, idx) => {
      doc.text(`${idx + 1}. ${r.name} (${r.type} of ${r.base}) - ₹${r.computedAmount}`);
    });
    doc.text(`Total from Earning Rules: ₹${payroll.totalEarnings}`);
    doc.moveDown(0.5);
  }

  // Deductions
  doc.fontSize(11).text("DEDUCTIONS", { underline: true });
  const deductions = payroll.appliedRules.filter((r) => r.category === "deduction");
  deductions.forEach((r, idx) => {
    doc.text(`${idx + 1}. ${r.name} (${r.type} of ${r.base}) - ₹${r.computedAmount}`);
  });
  doc.text(`(B) DEDUCTIONS TOTAL: ₹${payroll.totalDeductions}`);
  doc.moveDown(0.5);

  // Net Pay
  doc.fontSize(12).text(`NET PAYABLE: ₹${payroll.netPay}`, { underline: true });
  doc.moveDown();
  doc.text(`Working Days: ${payroll.workingDays}`);
  doc.text(`Holidays: ${payroll.holidaysCount}`);
  doc.text(`Present Days: ${payroll.presentDays}`);
  doc.text(`Paid Leaves: ${payroll.paidLeaveDays}`);
  doc.text(`Unpaid Leaves (LOP): ${payroll.unpaidLeaveDays}`);

  doc.moveDown();
  doc.text("Applied Rules:");
  payroll.appliedRules.forEach((r) => {
    doc.text(`- ${r.name} (${r.category}, ${r.type} of ${r.base}): ₹${r.computedAmount}`);
  });

  doc.moveDown(2);
  if (slip.remark) {
    doc.fontSize(9).fillColor("#333").text(`Note: ${slip.remark}`);
    doc.fillColor("#000");
    doc.moveDown(1);
  }
  doc.text("Authorized Signature", { align: "right" });

  doc.end();
}

module.exports = { generatePayslipPDF, generatePayslipPDFStream };