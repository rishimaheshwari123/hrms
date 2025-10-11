const Holiday = require("../models/holidayModel");
const Employee = require("../models/employeeModel");

// Create or update a holiday
const upsertHolidayCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description, recurrence, createdBy } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: "title and date are required" });
    }

    if (createdBy) {
      const admin = await Employee.findById(createdBy);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin can manage holidays" });
      }
    }

    let holiday;
    if (id) {
      holiday = await Holiday.findByIdAndUpdate(
        id,
        { title, date, description, recurring: recurrence, createdBy },
        { new: true }
      );
    } else {
      holiday = await Holiday.create({ title, date, description, recurring: recurrence, createdBy });
    }

    return res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    console.error("UPSERT HOLIDAY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Delete a holiday
const deleteHolidayCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { requesterId } = req.body;

    const admin = await Employee.findById(requesterId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete holidays" });
    }

    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    return res.status(200).json({ success: true, message: "Holiday deleted" });
  } catch (error) {
    console.error("DELETE HOLIDAY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get holidays for a specific month/year or whole year
// GET /api/v1/holiday/list?year=YYYY&month=MM
const listHolidaysCtrl = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month, 10) : null;

    let start, end;
    if (month) {
      start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    } else {
      start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    }

    const holidays = await Holiday.find({
      $or: [
        { date: { $gte: start, $lte: end } },
        { recurring: true }, // show recurring holidays regardless of year
      ],
    }).sort({ date: 1 });

    return res.status(200).json({ success: true, count: holidays.length, holidays });
  } catch (error) {
    console.error("LIST HOLIDAYS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  upsertHolidayCtrl,
  deleteHolidayCtrl,
  listHolidaysCtrl,
};