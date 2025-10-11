const express = require("express");
const router = express.Router();
const {
  addSalaryCtrl,
  editSalaryCtrl,
  getSalaryByIdCtrl,
  getSalaryHistoryCtrl,
} = require("../controllers/salaryCtrl");

router.post("/create", addSalaryCtrl);
router.put("/update/:id", editSalaryCtrl);
router.get("/get/:id", getSalaryByIdCtrl);

// New: Salary History for an employee
router.get("/history/:id", getSalaryHistoryCtrl);

module.exports = router;
