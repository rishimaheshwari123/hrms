const express = require("express");
const { verifyAccessToken, requireRole } = require("../middlewares/auth");
const { submitTimesheet, approveTimesheet, rejectTimesheet } = require("../controllers/timesheetCtrl");

const router = express.Router();

router.post("/", verifyAccessToken, submitTimesheet);
router.post("/:id/approve", verifyAccessToken, requireRole("manager"), approveTimesheet);
router.post("/:id/reject", verifyAccessToken, requireRole("manager"), rejectTimesheet);

module.exports = router;