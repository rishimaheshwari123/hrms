const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["note", "reply"], required: true },
    text: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    replyTo: { type: mongoose.Schema.Types.ObjectId },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const doubtSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    taskCode: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "open", "in_progress", "done", "approved", "rejected"],
      default: "pending",
    },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },

    // Review / acceptance metadata
    acceptedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },

    // Collaboration
    doubts: { type: [doubtSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);