const Attendance = require("../models/attendanceModel");
const dayjs = require("dayjs");

function toDateKey(date = new Date()) {
  return dayjs(date).format("YYYY-MM-DD");
}

function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function withinShiftWindow(now) {
  const start = process.env.SHIFT_START || "09:00"; // HH:mm
  const tolerance = parseInt(process.env.SHIFT_TOLERANCE_MINUTES || "30", 10);
  const [h, m] = start.split(":").map(Number);
  const startDate = dayjs(now).hour(h).minute(m).second(0);
  const diff = Math.abs(dayjs(now).diff(startDate, "minute"));
  return diff <= tolerance;
}

exports.clockIn = async (req, res) => {
  try {
    const { employeeId, deviceId, lat, lng } = req.body;
    if (!employeeId) {
      return res.status(400).json({ ok: false, message: "employeeId is required" });
    }

    const dateKey = toDateKey();

    const existing = await Attendance.findOne({ employee: employeeId, dateKey });
    if (existing && existing.clockIn) {
      return res.status(409).json({ ok: false, message: "Already clocked-in for today" });
    }

    // Enforce shift window
    if (!withinShiftWindow(new Date())) {
      return res.status(403).json({ ok: false, message: "Clock-in not allowed outside shift window" });
    }

    // Optional geofence
    const polygonRaw = process.env.OFFICE_POLYGON; // JSON string like [[lat,lng], [lat,lng], ...]
    if (polygonRaw && lat != null && lng != null) {
      let poly;
      try { poly = JSON.parse(polygonRaw); } catch { poly = null; }
      if (Array.isArray(poly) && poly.length >= 3) {
        if (!pointInPolygon([lat, lng], poly)) {
          return res.status(403).json({ ok: false, message: "Outside office geofence" });
        }
      }
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

    const att = existing || new Attendance({ employee: employeeId, dateKey });
    att.clockIn = new Date();
    att.deviceId = deviceId;
    att.geo = { lat, lng };
    att.ip = ip;
    att.status = "ClockedIn";

    // Late flag
    const start = process.env.SHIFT_START || "09:00";
    const [sh, sm] = start.split(":").map(Number);
    const startDate = dayjs().hour(sh).minute(sm).second(0);
    att.isLate = dayjs(att.clockIn).isAfter(startDate.add(parseInt(process.env.LATE_THRESHOLD_MINUTES || "0", 10), "minute"));

    await att.save();

    return res.status(200).json({ ok: true, attendanceId: att._id, clockIn: att.clockIn });
  } catch (err) {
    console.error("Clock-in error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ ok: false, message: "Attendance already exists for today" });
    }
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ ok: false, message: "employeeId is required" });
    }

    const dateKey = toDateKey();

    const att = await Attendance.findOne({ employee: employeeId, dateKey });
    if (!att || !att.clockIn) {
      return res.status(404).json({ ok: false, message: "Clock-in record not found" });
    }
    if (att.clockOut) {
      return res.status(409).json({ ok: false, message: "Already clocked-out for today" });
    }

    att.clockOut = new Date();
    att.status = "ClockedOut";

    await att.save();

    return res.status(200).json({ ok: true, attendanceId: att._id, clockOut: att.clockOut });
  } catch (err) {
    console.error("Clock-out error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};