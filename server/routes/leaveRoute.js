const express = require("express");
const router = express.Router();
const {
  getLeaveBalanceCtrl,
  applyLeaveCtrl,
  approveRejectLeaveCtrl,
  getLeavesCtrl,
} = require("../controllers/leaveCtrl");

// Get remaining leave balances per type
router.get("/balance/:employeeId", getLeaveBalanceCtrl);

// Employee apply for leave
router.post("/apply", applyLeaveCtrl);

// HR/Admin approve or reject leave
router.patch("/decision/:leaveId", approveRejectLeaveCtrl);

// List leaves (optional filter by status/employee)
router.get("/list", getLeavesCtrl);

module.exports = router;