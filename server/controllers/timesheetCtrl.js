const Timesheet = require("../models/timesheetModel");

function validateDailyHours(entries) {
  const sums = new Map();
  for (const e of entries) {
    const key = new Date(e.date).toDateString();
    sums.set(key, (sums.get(key) || 0) + Number(e.hours || 0));
    if (sums.get(key) > 24) {
      return { ok: false, message: `Daily hours exceed limit on ${key}` };
    }
  }
  return { ok: true };
}

exports.submitTimesheet = async (req, res) => {
  try {
    const { employeeId, weekStart, entries } = req.body;
    if (!employeeId || !weekStart || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const validation = validateDailyHours(entries);
    if (!validation.ok) return res.status(400).json({ ok: false, message: validation.message });

    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
    const totalBillableHours = entries.reduce((sum, e) => sum + (e.billable ? Number(e.hours || 0) : 0), 0);

    const ts = await Timesheet.findOneAndUpdate(
      { employee: employeeId, weekStart: new Date(weekStart) },
      {
        employee: employeeId,
        weekStart: new Date(weekStart),
        entries,
        status: "Submitted",
        totalHours,
        totalBillableHours,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ ok: true, timesheetId: ts._id });
  } catch (err) {
    console.error("Submit timesheet error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

exports.approveTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const actor = req.user;
    const ts = await Timesheet.findById(id);
    if (!ts) return res.status(404).json({ ok: false, message: "Timesheet not found" });

    ts.status = "Approved";
    ts.approvedBy = actor.id;
    ts.approvedAt = new Date();
    await ts.save();

    return res.status(200).json({ ok: true, status: ts.status });
  } catch (err) {
    console.error("Approve timesheet error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

exports.rejectTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const ts = await Timesheet.findById(id);
    if (!ts) return res.status(404).json({ ok: false, message: "Timesheet not found" });

    ts.status = "Rejected";
    ts.remarks = remarks;
    await ts.save();

    return res.status(200).json({ ok: true, status: ts.status });
  } catch (err) {
    console.error("Reject timesheet error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};