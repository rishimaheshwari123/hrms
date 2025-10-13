const express = require("express");
const router = express.Router();
const { listActivitiesAdminCtrl, listActivitiesForEmployeeCtrl, markActivitySeenCtrl } = require("../controllers/activityCtrl");

// Admin: list all activities
router.get("/admin", listActivitiesAdminCtrl);
// Employee: list own activities
router.get("/employee/:employeeId", listActivitiesForEmployeeCtrl);
// Mark seen
router.post("/seen/:id", markActivitySeenCtrl);

module.exports = router;