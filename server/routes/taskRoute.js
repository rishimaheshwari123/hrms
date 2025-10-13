const express = require("express");
const router = express.Router();
const { createTaskCtrl, updateTaskCtrl, listTasksForEmployeeCtrl, listTasksByAdminCtrl } = require("../controllers/taskCtrl");

// Create task (admin)
router.post("/create", createTaskCtrl);
// Update task (status, etc.)
router.put("/:id", updateTaskCtrl);
// List tasks for an employee
router.get("/employee/:employeeId", listTasksForEmployeeCtrl);
// Admin list all tasks
router.get("/all", listTasksByAdminCtrl);

module.exports = router;