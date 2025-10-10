const express = require("express");
const router = express.Router();
const {
  addSalaryCtrl,
  editSalaryCtrl,
  getSalaryByIdCtrl,
} = require("../controllers/salaryCtrl");


router.post("/create",  addSalaryCtrl);

router.put("/update/:id",  editSalaryCtrl);

router.get("/get/:id",  getSalaryByIdCtrl);


module.exports = router;
