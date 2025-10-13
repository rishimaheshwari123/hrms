const Task = require("../models/taskModel");
const Activity = require("../models/activityModel");

exports.createTaskCtrl = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    const assignedBy = req.user?._id || req.body.assignedBy; // fallback if auth not present

    // Generate sequential taskCode like TASK-00001
    const lastTask = await Task.findOne({}, { taskCode: 1 }).sort({ createdAt: -1 }).lean();
    let nextNumber = 1;
    if (lastTask?.taskCode) {
      const m = String(lastTask.taskCode).match(/TASK-(\d+)/);
      if (m) nextNumber = parseInt(m[1], 10) + 1;
    }
    const taskCode = `TASK-${String(nextNumber).padStart(5, "0")}`;

    const task = await Task.create({ taskCode, title, description, assignedTo, assignedBy, dueDate, priority });

    // Log activity
    await Activity.create({
      actor: assignedBy,
      targetEmployee: assignedTo,
      type: "task_created",
      message: `Task assigned: ${title}`,
      meta: { taskId: task._id, taskCode },
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

    // Support $push for doubts/comments
    let updateQuery = {};
    const setFields = { ...updates };
    // Remove non-schema fields from $set
    delete setFields.$push;
    delete setFields.activityType;
    delete setFields.activityMessage;
    delete setFields.actor;

    if (updates.$push) {
      updateQuery = { $set: setFields, $push: updates.$push };
    } else {
      updateQuery = setFields;
    }

    const task = await Task.findByIdAndUpdate(id, updateQuery, { new: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // activity
    const type = updates.activityType || (updates.status === "done" ? "task_completed" : "task_updated");
    const message = updates.activityMessage || `Task ${updates.status === "done" ? "completed" : "updated"}: ${task.title}`;
    await Activity.create({
      actor: req.user?._id || updates.actor,
      targetEmployee: task.assignedTo,
      type,
      message,
      meta: { taskId: task._id, taskCode: task.taskCode },
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