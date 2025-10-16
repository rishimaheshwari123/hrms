const fs = require("fs");
const path = require("path");
let PDFDocument;
try {
  PDFDocument = require("pdfkit");
} catch (e) {
  throw new Error("Please install pdfkit: npm install pdfkit");
}

function getMonthName(monthNumber) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[monthNumber - 1] || "-";
}

function drawBoxedText(doc, text, x, y, width, align = "left", fontSize = 10) {
  doc.fontSize(fontSize).text(text, x, y, {
    width: width,
    align: align,
    ellipsis: true,
  });
}

async function generatePayslipPDFStream({ employee, payroll, slip, res }) {
 const filename = `${employee.name }_Salary_Slip_${getMonthName(slip.month)}.pdf`;
res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
res.setHeader("Access-Control-Expose-Headers", "Content-Disposition"); // <<< important



  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  const startX = 50;
  const endX = 550;
  const colWidth = (endX - startX) / 3;
  const employeeDetailColDividerX = 300;
  const employeeDetailsPadding = 5;

  // --- HEADER ---
  const headerTop = doc.y;
  const headerHeight = 70;
  const logoPath = path.join(__dirname, "logo.jpeg");
  const addressText =
    "7TH FLOOR, SILVER STADDLE, OPP. YASH COMPLEX, GOTRI ROAD, GOTRI. VADODARA.";
  const contactText = "+91-7021287637";

  doc
    .rect(startX, headerTop, endX - startX, headerHeight)
    .strokeColor("#000")
    .lineWidth(0.5)
    .stroke();

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, startX + 5, headerTop + 5, { width: 60 });
  }

  doc
    .fontSize(18)
    .text("SALARY SLIP", startX + colWidth, headerTop + 10, {
      width: colWidth,
      align: "center",
      underline: true,
    });

  doc
    .fontSize(12)
    .text(`${getMonthName(slip.month)} ${slip.year}`, startX + colWidth, headerTop + 35, {
      width: colWidth,
      align: "center",
    });

  doc
    .fontSize(9)
    .text(addressText, startX + 2 * colWidth, headerTop + 5, {
      width: colWidth - 5,
      align: "right",
    })
    .text(contactText, startX + 2 * colWidth, headerTop + 35, {
      width: colWidth - 5,
      align: "right",
    });

  doc.y = headerTop + headerHeight + 10;

  // --- EMPLOYEE DETAILS ---
  const detailsBoxTop = doc.y;
  const detailsBoxHeight = 2 * (doc.currentLineHeight() + employeeDetailsPadding) + employeeDetailsPadding;

  let detailY = detailsBoxTop + employeeDetailsPadding / 2;
  doc
    .fontSize(10)
    .text(`NAME: ${employee.name || "-"}`, startX + employeeDetailsPadding, detailY, {
      continued: true,
      width: employeeDetailColDividerX - startX - employeeDetailsPadding,
    })
    .text(
      `DEPARTMENT: ${employee.department || "-"}`,
      employeeDetailColDividerX + employeeDetailsPadding,
      detailY,
      { width: endX - employeeDetailColDividerX - employeeDetailsPadding }
    );

  detailY += doc.currentLineHeight() + employeeDetailsPadding;

  doc
    .fontSize(10)
    .text(`DESIGNATION: ${employee.designation || "-"}`, startX + employeeDetailsPadding, detailY, {
      continued: true,
      width: employeeDetailColDividerX - startX - employeeDetailsPadding,
    })
    .text(
      `EMPLOYEE ID: ${employee.employeeCode || "-"}`,
      employeeDetailColDividerX + employeeDetailsPadding,
      detailY,
      { width: endX - employeeDetailColDividerX - employeeDetailsPadding }
    );

  doc
    .rect(startX, detailsBoxTop, endX - startX, detailsBoxHeight)
    .strokeColor("#000")
    .lineWidth(0.5)
    .stroke();
  doc.moveTo(employeeDetailColDividerX, detailsBoxTop).lineTo(employeeDetailColDividerX, detailsBoxTop + detailsBoxHeight).stroke();
  doc.moveTo(startX, detailsBoxTop + detailsBoxHeight / 2).lineTo(endX, detailsBoxTop + detailsBoxHeight / 2).stroke();

  doc.y = detailsBoxTop + detailsBoxHeight + 10;

  // --- TABLE CONSTANTS ---
  const tableLeft = startX;
  const tableRight = endX;
  const tableWidth = tableRight - tableLeft;
  const rowHeight = 20;
  const descColX = tableLeft + 5;
  const amountColX = tableRight - 100;
  const amountColWidth = 90;

  const earnings = [
    { label: "BASIC", amount: slip.basic || 0 },
    { label: "HRA", amount: slip.hra || 0 },
    { label: "CONVEYANCE", amount: slip.conveyance || 0 },
    { label: "SPECIAL ALLOWANCE", amount: slip.specialAllowance || 0 },
    { label: "MEAL ALLOWANCE", amount: slip.mealAllowance || 0 },
  ];

  const deductions = payroll.appliedRules
    .filter((r) => r.category === "deduction")
    .map((r) => ({ label: r.name, amount: r.computedAmount }));

  // Add unpaid leave as a deduction
  const totalDays = payroll.workingDays || 30;
  const unpaidLeave = payroll.unpaidLeaveDays || 0;
  const paidLeave = payroll.paidLeaveDays || 0;
  const gross = earnings.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const perDaySalary = totalDays > 0 ? gross / totalDays : 0;
  const unpaidDeduction = perDaySalary * unpaidLeave;

  if (unpaidLeave > 0) {
    deductions.push({ label: `Unpaid Leave (${unpaidLeave} days)`, amount: unpaidDeduction });
  }

  const earningTotal = earnings.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const deductionTotal = deductions.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const netPay = earningTotal - deductionTotal;

  // --- EARNINGS TABLE ---
  let currentY = doc.y + 10;
  const earningsTableTop = currentY;

  drawBoxedText(doc, "DESCRIPTION", descColX, currentY, 200, "left", 11);
  drawBoxedText(doc, "AMOUNT (IN)", amountColX, currentY, amountColWidth, "right", 11);
  currentY += rowHeight;
  doc.moveTo(tableLeft, currentY - 5).lineTo(tableRight, currentY - 5).stroke();

  earnings.forEach((e, idx) => {
    drawBoxedText(doc, `${idx + 1}. ${e.label}`, descColX, currentY, 200, "left");
    drawBoxedText(doc, e.amount ? e.amount.toFixed(2) : "NA", amountColX, currentY, amountColWidth, "right");
    currentY += rowHeight;
  });

  // Earnings Total with Top Border Only
  doc.moveTo(tableLeft, currentY).lineTo(tableRight, currentY).lineWidth(0.8).stroke();
  currentY += 10;
  drawBoxedText(doc, "(A) EARNINGS TOTAL", descColX, currentY, 200, "left", 10);
  drawBoxedText(doc, earningTotal.toFixed(2), amountColX, currentY, amountColWidth, "right", 10);
  currentY += rowHeight;

  const earningsTableBottom = currentY;
  doc.rect(tableLeft, earningsTableTop - 5, tableWidth, earningsTableBottom - earningsTableTop + 5).stroke();

  // --- DEDUCTIONS TABLE ---
  currentY += 10;
  const deductionsTableTop = currentY;

  drawBoxedText(doc, "DEDUCTIONS", descColX, currentY, 200, "left", 11);
  drawBoxedText(doc, "AMOUNT (IN)", amountColX, currentY, amountColWidth, "right", 11);
  currentY += rowHeight;
  doc.moveTo(tableLeft, currentY - 5).lineTo(tableRight, currentY - 5).stroke();

  deductions.forEach((d, idx) => {
    drawBoxedText(doc, `${idx + 1}. ${d.label}`, descColX, currentY, 200, "left");
    drawBoxedText(doc, d.amount ? d.amount.toFixed(2) : "NA", amountColX, currentY, amountColWidth, "right");
    currentY += rowHeight;
  });

  // Deductions Total with Top Border Only
  doc.moveTo(tableLeft, currentY).lineTo(tableRight, currentY).lineWidth(0.8).stroke();
  currentY += 10;
  drawBoxedText(doc, "(B) DEDUCTIONS TOTAL", descColX, currentY, 200, "left", 10);
  drawBoxedText(doc, deductionTotal.toFixed(2), amountColX, currentY, amountColWidth, "right", 10);
  currentY += rowHeight;

  const deductionsTableBottom = currentY;
  doc.rect(tableLeft, deductionsTableTop - 5, tableWidth, deductionsTableBottom - deductionsTableTop + 5).stroke();

  // --- NET PAYABLE ---
  doc.moveDown(1);
  const netPayStartY = doc.y;
  doc.fontSize(11).text(`NET PAYABLE = (A) - (B)`, tableLeft, netPayStartY);
  doc.fontSize(11).text(netPay.toFixed(2), amountColX, netPayStartY, {
    width: amountColWidth,
    align: "right",
  });

  // --- Payment Info ---
  doc.moveDown(1);
  doc.text(`MODE OF PAYMENT: ${slip.paymentMode || "IMPS"}`, tableLeft, doc.y);
  doc.text(
    `PAYMENT TRANSFERRED TO: ${employee.salary?.bankDetails?.accountNumber || "-"}`,
    tableLeft,
    doc.y
  );

  // --- SIGNATURE ---
  doc.moveDown(2);
  const footerY = doc.y + 2;

  doc.font("Helvetica-Bold")
    .fontSize(10)
    .text("For and behalf of VARN DIGIHEALTH", 0, footerY + 10, {
      align: "right",
      width: endX,
    });

  const signPath = path.join(__dirname, "sign.png");
  if (fs.existsSync(signPath)) {
    doc.image(signPath, endX - 120, doc.y + 0, { width: 140 });
  }

  doc.font("Helvetica-Bold")
    .fontSize(10)
    .text("- Authorized Signatory", 0, doc.y + 80, {
      align: "right",
      width: endX,
    });

  doc.end();
}

module.exports = { generatePayslipPDFStream };
