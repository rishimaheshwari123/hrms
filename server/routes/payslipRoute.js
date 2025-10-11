const express = require("express");
const router = express.Router();
const { generatePayslipCtrl, listPayslipsCtrl } = require("../controllers/payslipCtrl");

router.get("/list", listPayslipsCtrl);
router.post("/generate/:payslipId", generatePayslipCtrl);

module.exports = router;