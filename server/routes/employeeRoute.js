const express = require("express")
const { loginEmployeeCtrl, registerEmployeeCtrl, editEmployeeCtrl, verifyEmployeeCtrl } = require("../controllers/employeeCtrl")
const router = express.Router()


router.post("/login", loginEmployeeCtrl)
router.post("/register", registerEmployeeCtrl)
router.put("/update-employee/:id", editEmployeeCtrl)
router.put("/verify/:id" , verifyEmployeeCtrl);


module.exports = router