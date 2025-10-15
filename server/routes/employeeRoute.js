const express = require("express")
const { loginEmployeeCtrl, registerEmployeeCtrl, editEmployeeCtrl, verifyEmployeeCtrl, getAllEmployeesCtrl, getEmployeeByIdCtrl, uploadAdminDocsCtrl, uploadEmployeeDoctCtrl } = require("../controllers/employeeCtrl")
const router = express.Router()


router.post("/login", loginEmployeeCtrl)
router.post("/register", registerEmployeeCtrl)
router.put("/update-employee/:id", editEmployeeCtrl)
router.put("/verify/:id" , verifyEmployeeCtrl);
router.get("/getAll" , getAllEmployeesCtrl);
router.get("/get/:id" , getEmployeeByIdCtrl);
router.post("/upload-admin-docs/:id", uploadAdminDocsCtrl);
router.post("/upload-emp-docs/:id", uploadEmployeeDoctCtrl);


module.exports = router