const mongoose = require("mongoose");

const geoSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    dateKey: { type: String, required: true }, // YYYY-MM-DD for uniqueness
    clockIn: { type: Date },
    clockOut: { type: Date },
    deviceId: { type: String },
    geo: geoSchema,
    ip: { type: String },
    shiftId: { type: String },
    status: { type: String, enum: ["ClockedIn", "ClockedOut", "Incomplete", "Violation"], default: "Incomplete" },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);