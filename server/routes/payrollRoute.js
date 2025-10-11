const express = require("express");
const router = express.Router();
const { runPayrollCtrl, getPayrollCtrl, deletePayrollCtrl } = require("../controllers/payrollCtrl");

router.post("/run", runPayrollCtrl);
router.get("/list", getPayrollCtrl);
router.delete("/delete", deletePayrollCtrl);

module.exports = router;