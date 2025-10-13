const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    status: { type: String, enum: ["open", "in_progress", "done"], default: "open" },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);