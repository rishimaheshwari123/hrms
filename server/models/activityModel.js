const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    targetEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    type: { type: String, required: true },
    message: { type: String },
    meta: { type: Object },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);