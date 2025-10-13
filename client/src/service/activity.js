import { apiConnector } from "./apiConnector";

export const activity = {
  ADMIN_LIST: "/api/v1/activities/admin",
  EMPLOYEE_LIST: (employeeId) => `/api/v1/activities/employee/${employeeId}`,
  MARK_SEEN: (id) => `/api/v1/activities/seen/${id}`,
};

export async function listActivitiesAdminAPI(headers) {
  return apiConnector("GET", activity.ADMIN_LIST, null, { headers });
}

export async function listActivitiesForEmployeeAPI(employeeId, headers) {
  return apiConnector("GET", activity.EMPLOYEE_LIST(employeeId), null, { headers });
}

export async function markActivitySeenAPI(id, payload, headers) {
  return apiConnector("POST", activity.MARK_SEEN(id), payload, { headers });
}