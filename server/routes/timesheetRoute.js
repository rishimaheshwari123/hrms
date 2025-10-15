const express = require("express");
const router = express.Router();
const { auth, isEmployee, isAdmin } = require("../middleware/auth");
const {
  createEntryCtrl,
  getMyCtrl,
  updateEntryCtrl,
  listAdminCtrl,
  getEmployeeCtrl,
  updateEntryAdminCtrl,
} = require("../controllers/timesheetCtrl");

// Employee endpoints
router.post("/entry", auth, isEmployee, createEntryCtrl);
router.get("/me", auth, isEmployee, getMyCtrl);
router.patch("/entry/:id", auth, isEmployee, updateEntryCtrl);

// Admin endpoints
router.get("/admin", auth, isAdmin, listAdminCtrl);
router.get("/employee/:id", auth, isAdmin, getEmployeeCtrl);
router.patch("/admin/:id", auth, isAdmin, updateEntryAdminCtrl);

module.exports = router;