import { apiConnector } from "../apiConnector";
import { rules } from "../apis";
import { toast } from "react-toastify";

function getStoredUserId() {
  try {
    const u = localStorage.getItem("user");
    if (!u) return null;
    const parsed = JSON.parse(u);
    return parsed?._id || parsed?.id || null;
  } catch {
    return null;
  }
}

export async function listRulesAPI({ token, filters = {} }) {
  try {
    const { active, category } = filters;
    const params = new URLSearchParams();
    if (active !== undefined) params.append("active", String(active));
    if (category) params.append("category", category);
    const url = params.toString() ? `${rules.LIST}?${params}` : rules.LIST;
    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to list rules");
    return response.data.rules || [];
  } catch (error) {
    console.error("LIST RULES ERROR:", error);
    toast.error(error.message || "Failed to fetch rules");
    return [];
  }
}

export async function createRuleAPI({ token, payload }) {
  try {
    const requesterId = getStoredUserId();
    const body = {
      ...payload,
      createdBy: payload?.createdBy ?? requesterId,
      requesterId: payload?.requesterId ?? requesterId,
    };
    const response = await apiConnector("POST", rules.CREATE, body, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to create rule");
    toast.success("Rule created successfully");
    return response.data.data;
  } catch (error) {
    console.error("CREATE RULE ERROR:", error);
    toast.error(error.message || "Failed to create rule");
    throw error;
  }
}

export async function updateRuleAPI({ token, id, updates }) {
  try {
    const requesterId = getStoredUserId();
    const url = `${rules.UPDATE}/${id}`;
    const body = {
      ...updates,
      requesterId: updates?.requesterId ?? requesterId,
    };
    const response = await apiConnector("PUT", url, body, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to update rule");
    toast.success("Rule updated successfully");
    return response.data.data;
  } catch (error) {
    console.error("UPDATE RULE ERROR:", error);
    toast.error(error.message || "Failed to update rule");
    throw error;
  }
}

export async function deleteRuleAPI({ token, id, requesterId }) {
  try {
    const url = `${rules.DELETE}/${id}`;
    const body = { requesterId: requesterId ?? getStoredUserId() };
    const response = await apiConnector("DELETE", url, body, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to delete rule");
    toast.success("Rule deleted successfully");
    return true;
  } catch (error) {
    console.error("DELETE RULE ERROR:", error);
    toast.error(error.message || "Failed to delete rule");
    throw error;
  }
}