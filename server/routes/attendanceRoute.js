const express = require("express");
const rateLimit = require("express-rate-limit");
const { verifyAccessToken } = require("../middlewares/auth");
const { clockIn, clockOut } = require("../controllers/attendanceCtrl");

const router = express.Router();

const clockInLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.post("/clock-in", verifyAccessToken, clockInLimiter, clockIn);
router.post("/clock-out", verifyAccessToken, clockOut);

module.exports = router;