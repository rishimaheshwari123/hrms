const Timesheet = require("../models/timesheetModel");
const Employee = require("../models/employeeModel");
const mongoose = require("mongoose");

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function getRangeBounds(range = "day", baseDate) {
  const date = baseDate ? new Date(baseDate) : new Date();
  const day = startOfDay(date);
  const month = date.getMonth();
  const year = date.getFullYear();
  if (range === "day") {
    return { start: startOfDay(date), end: endOfDay(date) };
  }
  if (range === "week") {
    // Assuming week starts on Monday
    const d = new Date(day);
    const dayOfWeek = (d.getDay() + 6) % 7; // 0..6 (Mon..Sun)
    const start = new Date(d);
    start.setDate(d.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: startOfDay(start), end: endOfDay(end) };
  }
  // month
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start: startOfDay(start), end: endOfDay(end) };
}

// Employee: create a timesheet entry for today (or provided date)
exports.createEntryCtrl = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { date, notes } = req.body;
    const entryDate = date ? new Date(date) : new Date();
    const doc = { employee: employeeId, date: startOfDay(entryDate), notes };
    const created = await Timesheet.create(doc);
    return res.status(201).json({ success: true, data: created });
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ success: false, message: "Entry already exists for this day" });
    }
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to create timesheet entry" });
  }
};

// Employee: get own timesheets by range (day/week/month) optionally anchored at date
exports.getMyCtrl = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { range = "day", date } = req.query;
    const { start, end } = getRangeBounds(String(range), date);
    const items = await Timesheet.find({ employee: employeeId, date: { $gte: start, $lte: end } })
      .sort({ date: 1 });
    return res.json({ success: true, data: items, meta: { range, start, end } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to load timesheet" });
  }
};

// Employee: update own timesheet entry, allowed only if entry.date is today
exports.updateEntryCtrl = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;
    const entry = await Timesheet.findById(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timesheet entry not found" });
    }
    if (String(entry.employee) !== String(employeeId)) {
      return res.status(403).json({ success: false, message: "Not allowed to modify this entry" });
    }
    // Check same-day edit
    const today = new Date();
    const isSameDay = startOfDay(today).getTime() === startOfDay(entry.date).getTime();
    if (!isSameDay) {
      return res.status(403).json({ success: false, message: "Editing allowed only on the same day" });
    }
  if (typeof notes === "string") entry.notes = notes;
  await entry.save();
  return res.json({ success: true, data: entry });
} catch (e) {
  console.error(e);
  return res.status(500).json({ success: false, message: "Failed to update timesheet" });
}
};

// Admin: update any timesheet entry (date/notes/hours), no same-day restriction
exports.updateEntryAdminCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, notes } = req.body;
    const entry = await Timesheet.findById(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Timesheet entry not found" });
    }
    // Optionally update date (ensure unique per day per employee)
    if (date) {
      const newDate = startOfDay(new Date(date));
      entry.date = newDate;
    }
    if (typeof notes === "string") entry.notes = notes;
    try {
      await entry.save();
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ success: false, message: "Entry already exists for this day for this employee" });
      }
      throw err;
    }
    return res.json({ success: true, data: entry });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to update timesheet" });
  }
};

// Admin: list all timesheets by range, with optional employee filter and totals
exports.listAdminCtrl = async (req, res) => {
  try {
    const { range = "day", date, employeeId } = req.query;
    const { start, end } = getRangeBounds(String(range), date);
    const match = { date: { $gte: start, $lte: end } };
    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ success: false, message: "Invalid employeeId" });
      }
      match.employee = new mongoose.Types.ObjectId(employeeId);
    }

    const rows = await Timesheet.aggregate([
      { $match: match },
      { $lookup: { from: "employees", localField: "employee", foreignField: "_id", as: "emp" } },
      { $unwind: "$emp" },
      { $sort: { date: 1 } },
    ]);
    return res.json({ success: true, data: rows, meta: { range, start, end } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to load admin timesheets" });
  }
};

// Admin: get one employee's timesheets by range
exports.getEmployeeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "day", date } = req.query;
    const { start, end } = getRangeBounds(String(range), date);
    const items = await Timesheet.find({ employee: id, date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const emp = await Employee.findById(id).select("name firstName lastName email");
    return res.json({ success: true, data: items, employee: emp, meta: { range, start, end } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Failed to load employee timesheet" });
  }
};