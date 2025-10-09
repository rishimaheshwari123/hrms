const express = require("express")
const { loginEmployeeCtrl, registerEmployeeCtrl, editEmployeeCtrl, verifyEmployeeCtrl, refreshCtrl, logoutCtrl, forgotPasswordCtrl, resetPasswordCtrl, listEmployeesCtrl, getEmployeeCtrl, deleteEmployeeCtrl, createEmployeeCtrl } = require("../controllers/employeeCtrl")
const { verifyAccessToken, requireRole } = require("../middlewares/auth");
const router = express.Router()


router.post("/login", loginEmployeeCtrl)
router.post("/register", registerEmployeeCtrl)
router.post("/refresh", refreshCtrl)
router.post("/logout", logoutCtrl)
router.post("/forgot-password", forgotPasswordCtrl)
router.post("/reset-password", resetPasswordCtrl)
router.put("/update-employee/:id", editEmployeeCtrl)
router.put("/verify/:id" , verifyEmployeeCtrl);

// Protected employees CRUD routes
router.get("/employees", verifyAccessToken, requireRole("admin", "manager", "hr"), listEmployeesCtrl)
router.get("/employees/:id", verifyAccessToken, requireRole("admin", "manager", "hr"), getEmployeeCtrl)
router.delete("/employees/:id", verifyAccessToken, requireRole("admin"), deleteEmployeeCtrl)
router.post("/employees", verifyAccessToken, requireRole("admin", "manager", "hr"), createEmployeeCtrl)

// Protected example
router.get("/me", verifyAccessToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router