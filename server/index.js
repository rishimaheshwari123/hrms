const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");

dotenv.config();

const PORT = process.env.PORT || 4000;
connectDB();

app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();

// routes
app.use("/api/v1/auth", require("./routes/employeeRoute"));
app.use("/api/v1/salary", require("./routes/salaryRoute"));
app.use("/api/v1/image", require("./routes/imageRoute"));
app.use("/api/v1/leave", require("./routes/leaveRoute"));
app.use("/api/v1/holiday", require("./routes/holidayRoute"));
app.use("/api/v1/rules", require("./routes/deductionRuleRoute"));
app.use("/api/v1/payroll", require("./routes/payrollRoute"));
app.use("/api/v1/payslip", require("./routes/payslipRoute"));
app.use("/api/v1/tasks", require("./routes/taskRoute"));
app.use("/api/v1/activities", require("./routes/activityRoute"));
// Serve generated payslip PDFs statically
app.use("/payslips", express.static(path.join(__dirname, "payslips")));

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ... MAHI TECHNOCRAFTS",
  });
});



// ===== Monthly Scheduler =====
// ENV flags: CRON_ENABLED=true to enable jobs
const CRON_ENABLED = String(process.env.CRON_ENABLED || "true").toLowerCase() === "true";
if (CRON_ENABLED) {
  const Employee = require("./models/employeeModel");
  const { runPayrollCtrl } = require("./controllers/payrollCtrl");
  const { Payslip, PayrollRun } = require("./models/payrollModels");
  const { generatePayslipPDF } = require("./utils/payslipPdf");

  // Helper to run payroll for all employees for a given month/year
  async function runMonthlyPayroll(year, month) {
    try {
      const employees = await Employee.find({}).select("_id");
      const results = [];
      // Use controller logic by emulating a request
      for (const emp of employees) {
        const req = { body: { employeeId: emp._id, month, year, rounding: "nearest" } };
        const res = {
          status: () => ({ json: () => {} }),
          json: () => {},
        };
        try {
          await runPayrollCtrl(req, res);
          results.push({ employee: emp._id, status: "ok" });
        } catch (e) {
          results.push({ employee: emp._id, status: "error", message: e.message });
        }
      }
      console.log(`[CRON] Payroll finalized for ${year}-${month}`, results.length);
    } catch (e) {
      console.error("[CRON] runMonthlyPayroll error:", e);
    }
  }

  // Helper to generate payslips for all finalized payrolls
  async function generateMonthlyPayslips(year, month) {
    try {
      const prs = await PayrollRun.find({ year, month, status: "finalized" });
      for (const pr of prs) {
        const slip = await Payslip.findOne({ payrollRun: pr._id, employee: pr.employee, month, year });
        if (!slip) {
          // create if missing
          const created = await Payslip.create({ payrollRun: pr._id, employee: pr.employee, month, year, netPay: pr.netPay, gross: pr.grossBeforeDeductions, deductions: pr.totalDeductions });
          const filePath = await generatePayslipPDF({ employee: await Employee.findById(pr.employee).populate("salary"), payroll: pr, slip: created });
          created.pdfUrl = `${process.env.SERVER_URL || "http://localhost:" + PORT}/payslips/${path.basename(filePath)}`;
          await created.save();
        } else {
          const filePath = await generatePayslipPDF({ employee: await Employee.findById(pr.employee).populate("salary"), payroll: pr, slip });
          slip.pdfUrl = `${process.env.SERVER_URL || "http://localhost:" + PORT}/payslips/${path.basename(filePath)}`;
          await slip.save();
        }
      }
      console.log(`[CRON] Payslips generated for ${year}-${month}`);
    } catch (e) {
      console.error("[CRON] generateMonthlyPayslips error:", e);
    }
  }

  // 1) Last day of month at 23:55 → finalize payroll for current month
  // Cron format: "55 23 L * *" → node-cron doesn't support L; we compute last day manually
  cron.schedule("0 23 * * *", async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const last = new Date(year, month, 0).getDate();
    if (now.getDate() === last) {
      console.log("[CRON] Running end-of-month payroll...");
      await runMonthlyPayroll(year, month);
    }
  });

  // 2) On 5th day at 00:10 → generate payslips for previous month and set pdfUrl
  cron.schedule("10 0 5 * *", async () => {
    const now = new Date();
    // previous month
    const prev = new Date(now.getFullYear(), now.getMonth(), 0);
    const year = prev.getFullYear();
    const month = prev.getMonth() + 1;
    console.log("[CRON] Generating payslips for previous month...");
    await generateMonthlyPayslips(year, month);
  });
}

app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
