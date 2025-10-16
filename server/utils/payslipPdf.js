const fs = require("fs");
const path = require("path");
let PDFDocument;
try {
  PDFDocument = require("pdfkit");
} catch (e) {
  // If pdfkit not installed yet, we'll throw meaningful error at runtime
}

// --- GLOBAL CONSTANTS AND HELPER FUNCTIONS (FOR ALIGNMENT) ---
const TABLE_X_START = 50;
const TABLE_X_END = 550;
const AMOUNT_WIDTH = 100;
const DESCRIPTION_WIDTH = TABLE_X_END - TABLE_X_START - AMOUNT_WIDTH;
const AMOUNT_X_START = TABLE_X_END - AMOUNT_WIDTH; // 450

function drawHorizontalLine(doc, y, startX = TABLE_X_START, endX = TABLE_X_END) {
  doc.strokeColor("#aaaaaa")
     .lineWidth(0.5)
     .moveTo(startX, y)
     .lineTo(endX, y)
     .stroke();
}

// Full Width Table Header (Fixed column widths for alignment)
function drawTableHeader(doc, y, label1, label2) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#333');
    doc.text(label1, TABLE_X_START, y, { width: DESCRIPTION_WIDTH, align: 'left' }); 
    doc.text(label2, AMOUNT_X_START, y, { width: AMOUNT_WIDTH, align: 'right' }); 
    drawHorizontalLine(doc, y + 12, TABLE_X_START, TABLE_X_END);
    doc.font('Helvetica').fontSize(10).fillColor('#000');
    return y + 15;
}

// Full Width Table Row (Fixed column widths for alignment)
function drawTableRow(doc, y, label, amount, currency = "₹") {
    doc.text(label, TABLE_X_START, y, { width: DESCRIPTION_WIDTH, align: 'left' });
    // Ensures clean currency format and correct alignment
    doc.text(`${currency}${Number(amount).toFixed(2)}`, AMOUNT_X_START, y, { width: AMOUNT_WIDTH, align: 'right' });
    return y + 15;
}

// Full Width Table Total Row (Fixed column widths for alignment)
function drawTableTotal(doc, y, label, total, currency = "₹") {
    drawHorizontalLine(doc, y, TABLE_X_START, TABLE_X_END);
    y += 5;
    doc.font('Helvetica-Bold');
    doc.text(label, TABLE_X_START, y, { width: DESCRIPTION_WIDTH, align: 'left' });
    // Ensures clean currency format and correct alignment
    doc.text(`${currency}${Number(total).toFixed(2)}`, AMOUNT_X_START, y, { width: AMOUNT_WIDTH, align: 'right' });
    doc.font('Helvetica');
    drawHorizontalLine(doc, y + 12, TABLE_X_START, TABLE_X_END);
    return y + 20;
}

/**
 * Creates a clean, URL-safe filename in the format: employeename_month.pdf
 * Converts month number (1-12) to short name (jan-dec).
 */
function getCleanFilename({ employee, slip }) {
    const monthNamesShort = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    
    // 1. Employee name cleanup
    const employeeNameClean = (employee.name || "unknown_employee")
                                .toLowerCase()
                                .replace(/\s/g, '_')
                                .replace(/[^a-z0-9_]/g, ''); 
    
    // 2. Month conversion (assuming slip.month is a number 1-12)
    let monthName = 'unknown_month';
    const monthNumber = Number(slip.month);
    
    if (monthNumber >= 1 && monthNumber <= 12) {
        monthName = monthNamesShort[monthNumber - 1];
    } else {
        // Fallback for non-numeric/invalid month input
        monthName = String(slip.month || 'unknown_month').toLowerCase().replace(/\s/g, '_');
    }

    return `${employee.name}_${monthName}.pdf`;
}

// --- MAIN EXPORTED FUNCTION ---

async function generatePayslipPDFStream({ employee, payroll, slip, res }) {
    if (!PDFDocument) throw new Error("PDFKit not installed. Please install pdfkit");
    
    // --- 1. Filename Logic Applied ---
    const filename = getCleanFilename({ employee, slip });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // --- Data Preparation ---
    const { year, basic, hra, conveyance, specialAllowance, mealAllowance, currency = "₹" } = slip;
    const { totalEarnings, totalDeductions, netPay } = payroll;
    const companyName = "Company Name"; // Replaced hardcoded string with dynamic context where possible

    const monthNamesDisplay = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const displayMonth = monthNamesDisplay[Number(slip.month) - 1] || slip.month;

    const salSnap = { basic, hra, conveyance, specialAllowance, mealAllowance, currency };
    
    // Grouping Earnings
    const baseEarnings = [
        { label: "1. BASIC", amount: Number(salSnap.basic || 0) },
        { label: "2. HRA", amount: Number(salSnap.hra || 0) },
        { label: "3. CONVEYANCE", amount: Number(salSnap.conveyance || 0) },
        { label: "4. SPECIAL ALLOWANCE", amount: Number(salSnap.specialAllowance || 0) },
        { label: "5. MEAL ALLOWANCE", amount: Number(salSnap.mealAllowance || 0) },
    ];
    // Additional Earnings from payroll rules
    const otherEarnings = payroll.appliedRules.filter(r => r.category === "earning" && !baseEarnings.some(e => e.label.includes(r.label)));

    // Deductions from payroll rules
    const deductions = payroll.appliedRules.filter((r) => r.category === "deduction");

    let cursorY = doc.y;

    // --- A. Header Section ---
    doc.fontSize(18).text(companyName, { align: "center" });
    doc.fontSize(18).text("Tsnlklk Name (Company Subtitle)", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Payslip for ${displayMonth} ${year}`, { align: "center" });
    if (slip.remark) {
        doc.moveDown(0.25);
        doc.fontSize(9).fillColor("#333").text(`Remark: ${slip.remark}`, { align: "center" });
        doc.fillColor("#000");
    }
    doc.moveDown();

    // --- B. Employee Details ---
    doc.fontSize(10);
    const DETAIL_LINE_HEIGHT = 15;
    const COL2_X = 300;
    
    let employeeDetailsY = doc.y;
    let currentDetailY = employeeDetailsY;
    
    // Left Column
    doc.font('Helvetica-Bold').text("Employee Name:", TABLE_X_START, currentDetailY);
    doc.font('Helvetica').text(employee.name || "N/A", TABLE_X_START + 110, currentDetailY);
    currentDetailY += DETAIL_LINE_HEIGHT;
    
    doc.font('Helvetica-Bold').text("Employee ID:", TABLE_X_START, currentDetailY);
    doc.font('Helvetica').text(employee.employeeCode || employee._id || "N/A", TABLE_X_START + 110, currentDetailY);
    currentDetailY += DETAIL_LINE_HEIGHT;
    
    doc.font('Helvetica-Bold').text("Department:", TABLE_X_START, currentDetailY);
    doc.font('Helvetica').text(employee.department || "N/A", TABLE_X_START + 110, currentDetailY);
    currentDetailY += DETAIL_LINE_HEIGHT;
    
    // Right Column 
    currentDetailY = employeeDetailsY;
    
    doc.font('Helvetica-Bold').text("Pay Period:", COL2_X, currentDetailY);
    doc.font('Helvetica').text(`${displayMonth}-${year}`, COL2_X + 100, currentDetailY);
    currentDetailY += DETAIL_LINE_HEIGHT;

    // Set Y position for next section
    doc.y = Math.max(doc.y, currentDetailY) + 15; 
    drawHorizontalLine(doc, doc.y - 5);
    doc.moveDown(0.5);
    currentY = doc.y;


    // --- C. EARNINGS SECTION (Sequential Full Width Table) ---
    
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000');
    doc.text("EARNINGS (A)", TABLE_X_START, currentY); 
    currentY += 15;
    
    // Table Header
    currentY = drawTableHeader(doc, currentY, "DESCRIPTION", "AMOUNT IN RUPEES");

    // Base Earnings Rows
    baseEarnings.forEach(item => {
        currentY = drawTableRow(doc, currentY, item.label, item.amount, currency);
    });

    // Other Earnings Rows
    if (otherEarnings.length) {
        otherEarnings.forEach((r, idx) => {
             currentY = drawTableRow(doc, currentY, `${baseEarnings.length + idx + 1}. ${r.name}`, r.computedAmount, currency);
        });
    }

    // Earnings Total
    currentY = drawTableTotal(doc, currentY + 5, "(A) EARNINGS TOTAL", totalEarnings, currency);

    doc.moveDown(1);
    
    // --- D. DEDUCTIONS SECTION (Sequential Full Width Table) ---
    
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000');
    doc.text("DEDUCTIONS (B)", TABLE_X_START, currentY); 
    currentY += 15;
    
    // Table Header
    currentY = drawTableHeader(doc, currentY, "DESCRIPTION", "AMOUNT IN RUPEES");

    // Deductions Rows
    deductions.forEach((r, idx) => {
        currentY = drawTableRow(doc, currentY, `${idx + 1}. ${r.name} (${r.type} of ${r.base})`, r.computedAmount, currency);
    });
    
    // LOP/Unpaid Leaves
    currentY = drawTableRow(doc, currentY, `${deductions.length + 1}. UNPAID LEAVES (LOP) (${payroll.unpaidLeaveDays} days)`, payroll.unpaidLeaveDays > 0 ? payroll.unpaidLeaveDays : 0, currency);

    // Deductions Total
    currentY = drawTableTotal(doc, currentY + 5, "(B) DEDUCTIONS TOTAL", totalDeductions, currency);
    
    doc.moveDown(1);
    drawHorizontalLine(doc, currentY);
    currentY += 10;
    
    // --- E. Net Payable and Summary ---
    
    // Net Payable
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000');
    doc.text("NET PAYABLE $=(A)-(B)$", 50, currentY); 
    doc.text(`${currency} ${netPay.toFixed(2)}`, 550 - 150, currentY, { width: 150, align: 'right' }); 
    
    currentY += 25;
    
    // Attendance/Days Summary
    doc.font('Helvetica').fontSize(10).fillColor('#000');
    doc.text(`Working Days: ${payroll.workingDays}`, 50, currentY);
    doc.text(`Holidays: ${payroll.holidaysCount}`, 200, currentY);
    doc.text(`Present Days: ${payroll.presentDays}`, 350, currentY);
    currentY += 15;
    doc.text(`Paid Leaves: ${payroll.paidLeaveDays}`, 50, currentY);
    doc.text(`Unpaid Leaves (LOP): ${payroll.unpaidLeaveDays}`, 200, currentY);
    
    currentY += 30;

    // Signature Block and Remark
    if (slip.remark) {
        doc.fontSize(9).fillColor("#333").text(`Note: ${slip.remark}`, 50, currentY);
        doc.fillColor("#000");
        currentY += 15;
    }
    
    doc.text("Authorized Signature", 550 - 150, currentY, { width: 150, align: "right" });

    doc.end();
}

module.exports = { generatePayslipPDFStream };