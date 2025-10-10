import { apiConnector } from "../apiConnector";
import { holiday } from "../apis";
import { toast } from "react-toastify";

const { UPSERT, DELETE, LIST } = holiday;

export async function upsertHoliday(payload, token) {
  const toastId = toast.loading("Saving holiday...");
  try {
    const method = payload?.id ? "PUT" : "POST";
    const url = payload?.id ? `${UPSERT}/${payload.id}` : UPSERT;
    const payloadToSend = {
      ...payload,
      // Map UI recurrence (none/annual) to server boolean `recurring`
      recurring: payload?.recurrence && payload.recurrence !== "none",
      createdBy: payload?.createdBy,
    };
    const response = await apiConnector(method, url, payloadToSend, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Holiday saved successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("UPSERT HOLIDAY ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to save holiday.");
  }
}

export async function deleteHolidayAPI(id, token, requesterId) {
  const toastId = toast.loading("Deleting holiday...");
  try {
    const response = await apiConnector("DELETE", `${DELETE}/${id}`, { requesterId }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    toast.dismiss(toastId);
    toast.success(response?.data?.message || "Holiday deleted successfully!");

    return response?.data?.data;
  } catch (error) {
    console.error("DELETE HOLIDAY ERROR:", error);
    toast.dismiss(toastId);
    toast.error(error?.response?.data?.message || "Failed to delete holiday.");
  }
}

export async function listHolidays(params = {}, token) {
  try {
    const response = await apiConnector("GET", LIST, null, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong");
    }

    // Server returns { success, count, holidays }
    return response?.data?.holidays;
  } catch (error) {
    console.error("LIST HOLIDAYS ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch holidays.");
  }
}