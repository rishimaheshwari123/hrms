const Leave = require("../models/leaveModel");
const mailSender = require("../utils/mailSenderr");

function defaultApprovalChain() {
  return [
    { stepOrder: 1, role: "manager", status: "Pending" },
    { stepOrder: 2, role: "hr", status: "Pending" },
    { stepOrder: 3, role: "admin", status: "Pending" },
  ];
}

exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, from, to, reason, attachFiles } = req.body;
    if (!employeeId || !leaveType || !from || !to) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || toDate < fromDate) {
      return res.status(400).json({ ok: false, message: "Invalid date range" });
    }

    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.round((toDate - fromDate) / dayMs) + 1;

    const attachments = Array.isArray(attachFiles)
      ? attachFiles.map((f) => ({ url: f.url, name: f.name, size: f.size, mimeType: f.mimeType }))
      : [];

    // basic attachment validation
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    for (const a of attachments) {
      if (a.size && a.size > MAX_SIZE_BYTES) {
        return res.status(413).json({ ok: false, message: `Attachment too large: ${a.name}` });
      }
      if (a.mimeType && !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(a.mimeType)) {
        return res.status(415).json({ ok: false, message: `Unsupported attachment type: ${a.mimeType}` });
      }
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
      attachments,
      status: "Pending",
      approvalSteps: defaultApprovalChain(),
      currentStep: 0,
    });

    // notify applicant (basic)
    try {
      await mailSender(process.env.MAIL_USER, "Leave Applied", `Leave request ${leave._id} submitted.`);
    } catch {}

    return res.status(200).json({ ok: true, leaveId: leave._id });
  } catch (err) {
    console.error("Apply leave error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const actor = req.user; // from verifyAccessToken
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ ok: false, message: "Leave not found" });

    const step = leave.approvalSteps[leave.currentStep];
    if (!step) return res.status(400).json({ ok: false, message: "Approval chain not configured" });
    if (actor.role !== step.role) return res.status(403).json({ ok: false, message: `Only ${step.role} can approve this step` });

    step.approverId = actor.id;
    step.remarks = remarks;
    step.timestamp = new Date();
    step.status = "Approved";
    leave.approvedBy.push(actor.id);

    if (leave.currentStep + 1 < leave.approvalSteps.length) {
      leave.currentStep += 1;
      leave.status = "InProgress";
    } else {
      leave.status = "Approved";
    }

    await leave.save();

    try {
      await mailSender(process.env.MAIL_USER, "Leave Updated", `Leave ${leave._id} ${leave.status}`);
    } catch {}

    return res.status(200).json({ ok: true, status: leave.status });
  } catch (err) {
    console.error("Approve leave error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const actor = req.user;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ ok: false, message: "Leave not found" });

    const step = leave.approvalSteps[leave.currentStep];
    if (!step) return res.status(400).json({ ok: false, message: "Approval chain not configured" });
    if (actor.role !== step.role) return res.status(403).json({ ok: false, message: `Only ${step.role} can reject this step` });

    step.approverId = actor.id;
    step.remarks = remarks;
    step.timestamp = new Date();
    step.status = "Rejected";
    leave.status = "Rejected";

    await leave.save();

    try {
      await mailSender(process.env.MAIL_USER, "Leave Rejected", `Leave ${leave._id} rejected`);
    } catch {}

    return res.status(200).json({ ok: true, status: leave.status });
  } catch (err) {
    console.error("Reject leave error:", err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
};