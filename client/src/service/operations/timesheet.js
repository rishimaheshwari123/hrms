import { apiConnector } from "../apiConnector";
import { timesheet } from "../apis";
import { toast } from "react-toastify";

export async function createTimesheetEntryAPI(data, token) {
  const toastId = toast.loading("Saving today's timesheet...");
  try {
    const response = await apiConnector("POST", timesheet.CREATE, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to save timesheet");
    }
    toast.dismiss(toastId);
    toast.success("Timesheet saved");
    return response.data.data;
  } catch (error) {
    console.error("CREATE TIMESHEET ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to save timesheet.");
    throw error;
  }
}

export async function updateTimesheetEntryAPI(id, data, token) {
  const toastId = toast.loading("Updating timesheet...");
  try {
    const response = await apiConnector("PATCH", timesheet.UPDATE(id), data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to update timesheet");
    }
    toast.dismiss(toastId);
    toast.success("Timesheet updated");
    return response.data.data;
  } catch (error) {
    console.error("UPDATE TIMESHEET ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to update timesheet.");
    throw error;
  }
}

export async function updateTimesheetEntryAdminAPI(id, data, token) {
  const toastId = toast.loading("Updating timesheet (admin)...");
  try {
    const response = await apiConnector("PATCH", timesheet.UPDATE_ADMIN(id), data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to update timesheet");
    }
    toast.dismiss(toastId);
    toast.success("Timesheet updated");
    return response.data.data;
  } catch (error) {
    console.error("ADMIN UPDATE TIMESHEET ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to update timesheet.");
    throw error;
  }
}

export async function getMyTimesheetsAPI(range = "day", date, token) {
  try {
    const params = {};
    if (range) params.range = range;
    if (date) params.date = date;
    const response = await apiConnector("GET", timesheet.MY, null, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load timesheets");
    }
    return response.data;
  } catch (error) {
    console.error("GET MY TIMESHEETS ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load timesheets.");
    throw error;
  }
}

export async function listTimesheetsAdminAPI({ range = "day", date, employeeId } = {}, token) {
  try {
    const params = {};
    if (range) params.range = range;
    if (date) params.date = date;
    if (employeeId) params.employeeId = employeeId;
    const response = await apiConnector("GET", timesheet.ADMIN, null, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load timesheets");
    }
    return response.data;
  } catch (error) {
    console.error("ADMIN LIST TIMESHEETS ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load timesheets.");
    throw error;
  }
}

export async function getEmployeeTimesheetsAPI(id, { range = "day", date } = {}, token) {
  try {
    const params = {};
    if (range) params.range = range;
    if (date) params.date = date;
    const response = await apiConnector("GET", timesheet.EMPLOYEE(id), null, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load employee timesheets");
    }
    return response.data;
  } catch (error) {
    console.error("GET EMPLOYEE TIMESHEETS ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to load employee timesheets.");
    throw error;
  }
}