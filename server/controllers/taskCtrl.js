const Task = require("../models/taskModel");
const Activity = require("../models/activityModel");

exports.createTaskCtrl = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    const assignedBy = req.user?._id || req.body.assignedBy; // fallback if auth not present

    const task = await Task.create({ title, description, assignedTo, assignedBy, dueDate, priority });

    // Log activity
    await Activity.create({
      actor: assignedBy,
      targetEmployee: assignedTo,
      type: "task_created",
      message: `Task assigned: ${title}`,
      meta: { taskId: task._id },
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // activity
    await Activity.create({
      actor: req.user?._id || updates.actor,
      targetEmployee: task.assignedTo,
      type: updates.status === "done" ? "task_completed" : "task_updated",
      message: `Task ${updates.status === "done" ? "completed" : "updated"}: ${task.title}`,
      meta: { taskId: task._id },
    });

    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTasksForEmployeeCtrl = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await Task.find({ assignedTo: employeeId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTasksByAdminCtrl = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate("assignedTo", "firstName lastName").sort({ createdAt: -1 });
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};