const Leave = require("../models/leaveModel");
const Employee = require("../models/employeeModel");

// Leave policy per calendar year (can be adjusted as per company rules)
const LEAVE_POLICY = {
  "Casual Leave": 12,
  "Sick Leave": 12,
  "Paid Leave": 10,
  "Maternity Leave": 90,
  "Unpaid Leave": Infinity,
};

// Utility: Calculate inclusive total days between two dates
function calculateTotalDays(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (isNaN(start) || isNaN(end)) return null;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}

// Utility: Get used days for a leaveType in a given year
async function getUsedLeaveDays(employeeId, leaveType, year) {
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
  const leaves = await Leave.find({
    employee: employeeId,
    leaveType,
    status: "Approved",
    fromDate: { $gte: startOfYear },
    toDate: { $lte: endOfYear },
  }).select("totalDays");

  return leaves.reduce((sum, l) => sum + (l.totalDays || 0), 0);
}

// GET: Remaining leave balance per type
// GET /api/v1/leave/balance/:employeeId?year=YYYY
const getLeaveBalanceCtrl = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const balances = {};
    for (const type of Object.keys(LEAVE_POLICY)) {
      const allowed = LEAVE_POLICY[type];
      const used = await getUsedLeaveDays(employeeId, type, year);
      const remaining = allowed === Infinity ? Infinity : Math.max(allowed - used, 0);
      balances[type] = { allowed, used, remaining, year };
    }

    return res.status(200).json({ success: true, balances });
  } catch (error) {
    console.error("GET LEAVE BALANCE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST: Employee applies for leave
// POST /api/v1/leave/apply
// body: { employeeId, leaveType, fromDate, toDate, reason }
const applyLeaveCtrl = async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;

    if (!employeeId || !leaveType || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: "employeeId, leaveType, fromDate, toDate are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Validate leave type according to schema
    const allowedTypes = Object.keys(LEAVE_POLICY);
    if (!allowedTypes.includes(leaveType)) {
      return res.status(400).json({ success: false, message: "Invalid leave type" });
    }

    const totalDays = calculateTotalDays(fromDate, toDate);
    if (!totalDays || totalDays <= 0) {
      return res.status(400).json({ success: false, message: "Invalid date range" });
    }

    // Check balance unless Unpaid Leave
    const currentYear = new Date(fromDate).getFullYear();
    const allowed = LEAVE_POLICY[leaveType];
    const used = await getUsedLeaveDays(employeeId, leaveType, currentYear);
    const remaining = allowed === Infinity ? Infinity : Math.max(allowed - used, 0);
    if (allowed !== Infinity && totalDays > remaining) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} balance. Remaining: ${remaining}, Requested: ${totalDays}`,
      });
    }

    const newLeave = await Leave.create({
      employee: employeeId,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      status: "Pending",
    });

    employee.leaves = employee.leaves || [];
    employee.leaves.push(newLeave._id);
    await employee.save();

    return res.status(201).json({ success: true, message: "Leave applied successfully", data: newLeave });
  } catch (error) {
    console.error("APPLY LEAVE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// PATCH: HR/Admin approves or rejects a leave
// PATCH /api/v1/leave/decision/:leaveId
// body: { approverId, action: 'approve' | 'reject', remarks }
const approveRejectLeaveCtrl = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { approverId, action, remarks } = req.body;

    if (!approverId || !action) {
      return res.status(400).json({ success: false, message: "approverId and action are required" });
    }

    const approver = await Employee.findById(approverId);
    if (!approver) {
      return res.status(404).json({ success: false, message: "Approver not found" });
    }

    // Allow both Admin and HR roles to approve/reject
    const role = String(approver.role || "").toLowerCase();
    if (!(role === "admin" || role === "hr")) {
      return res.status(403).json({ success: false, message: "Only admin or HR can approve or reject leaves" });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending leaves can be updated" });
    }

    let newStatus;
    if (action === "approve") newStatus = "Approved";
    else if (action === "reject") newStatus = "Rejected";
    else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'reject'" });
    }

    leave.status = newStatus;
    leave.approvedBy = approverId;
    leave.remarks = remarks;
    await leave.save();

    return res.status(200).json({ success: true, message: `Leave ${newStatus.toLowerCase()}`, data: leave });
  } catch (error) {
    console.error("APPROVE/REJECT LEAVE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET: List leaves (optional filters: status, employeeId)
// GET /api/v1/leave/list?status=Pending&employeeId=...
const getLeavesCtrl = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    const leaves = await Leave.find(query)
      .populate("employee", "firstName lastName employeeCode email")
      .populate("approvedBy", "firstName lastName employeeCode email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    console.error("GET LEAVES ERROR:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getLeaveBalanceCtrl,
  applyLeaveCtrl,
  approveRejectLeaveCtrl,
  getLeavesCtrl,
};