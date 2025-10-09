const express = require("express");
const { verifyAccessToken, requireRole } = require("../middlewares/auth");
const { applyLeave, approveLeave, rejectLeave } = require("../controllers/leaveCtrl");

const router = express.Router();

// Apply leave
router.post("/", verifyAccessToken, applyLeave);

// Approvals chain
router.post("/:id/approve", verifyAccessToken, requireRole("manager", "hr", "admin"), approveLeave);
router.post("/:id/reject", verifyAccessToken, requireRole("manager", "hr", "admin"), rejectLeave);

module.exports = router;