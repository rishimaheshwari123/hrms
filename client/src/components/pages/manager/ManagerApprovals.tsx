import React, { useState } from "react";
import { LeaveSDK, TimesheetSDK } from "@/service/sdk/index";
import { toast } from "react-toastify";

const ManagerApprovals: React.FC = () => {
  const [leaveId, setLeaveId] = useState("");
  const [leaveRemarks, setLeaveRemarks] = useState("");

  const [timesheetId, setTimesheetId] = useState("");
  const [timesheetRemarks, setTimesheetRemarks] = useState("");

  const approveLeave = async () => {
    try {
      const res = await LeaveSDK.approve({ id: leaveId, remarks: leaveRemarks });
      toast.success(res?.data?.message || "Leave approved");
      setLeaveId("");
      setLeaveRemarks("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve leave");
    }
  };

  const rejectLeave = async () => {
    try {
      const res = await LeaveSDK.reject({ id: leaveId, remarks: leaveRemarks });
      toast.success(res?.data?.message || "Leave rejected");
      setLeaveId("");
      setLeaveRemarks("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject leave");
    }
  };

  const approveTimesheet = async () => {
    try {
      const res = await TimesheetSDK.approve(timesheetId);
      toast.success(res?.data?.message || "Timesheet approved");
      setTimesheetId("");
      setTimesheetRemarks("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve timesheet");
    }
  };

  const rejectTimesheet = async () => {
    try {
      const res = await TimesheetSDK.reject(timesheetId, timesheetRemarks);
      toast.success(res?.data?.message || "Timesheet rejected");
      setTimesheetId("");
      setTimesheetRemarks("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject timesheet");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mt-4">Manager Approvals</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Leave Approval</h2>
        <div className="flex gap-3 items-center">
          <input
            className="border rounded px-3 py-2"
            placeholder="Leave ID"
            value={leaveId}
            onChange={(e) => setLeaveId(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-80"
            placeholder="Remarks (optional)"
            value={leaveRemarks}
            onChange={(e) => setLeaveRemarks(e.target.value)}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={approveLeave}>
            Approve
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={rejectLeave}>
            Reject
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Timesheet Approval</h2>
        <div className="flex gap-3 items-center">
          <input
            className="border rounded px-3 py-2"
            placeholder="Timesheet ID"
            value={timesheetId}
            onChange={(e) => setTimesheetId(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-80"
            placeholder="Remarks (optional for rejection)"
            value={timesheetRemarks}
            onChange={(e) => setTimesheetRemarks(e.target.value)}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={approveTimesheet}>
            Approve
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={rejectTimesheet}>
            Reject
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManagerApprovals;