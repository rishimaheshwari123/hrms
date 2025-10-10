import { apiConnector } from "../apiConnector";
import { leave } from "../apis";
import { toast } from "react-toastify";

const { BALANCE, APPLY, DECISION, LIST } = leave;

export async function getLeaveBalance(employeeId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${BALANCE}/${employeeId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    // Server returns { success, balances }
    return response?.data?.balances;
  } catch (error) {
    console.error("GET LEAVE BALANCE ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch leave balance.");
  }
}

export async function applyLeave(payload, token) {
  const toastId = toast.loading("Submitting leave application...");
  try {
    // Map UI payload to server expected fields
    const mappedPayload = {
      employeeId: payload?.employeeId,
      leaveType: payload?.leaveType,
      fromDate: payload?.startDate,
      toDate: payload?.endDate,
      reason: payload?.reason,
    };

    const response = await apiConnector(
      "POST",
      APPLY,
      mappedPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Leave applied successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("APPLY LEAVE ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to apply for leave.");
  }
}

export async function listLeaves(query = {}, token) {
  try {
    const response = await apiConnector(
      "GET",
      LIST,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    // Server returns { success, count, leaves }
    return response?.data?.leaves;
  } catch (error) {
    console.error("LIST LEAVES ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch leaves.");
  }
}

export async function decideLeave(leaveId, decision, token, approverId, remarks = "") {
  const toastId = toast.loading("Processing decision...");

  try {
    const action = decision === "Approved" ? "approve" : "reject";
    const response = await apiConnector(
      "PATCH",
      `${DECISION}/${leaveId}`,
      { approverId, action, remarks },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Decision updated successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("DECIDE LEAVE ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to update decision.");
  }
}