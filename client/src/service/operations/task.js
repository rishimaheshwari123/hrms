import { apiConnector } from "../apiConnector";
import { task } from "../apis";

export async function createTaskAPI(payload, headers) {
  return apiConnector("POST", task.CREATE, payload, { headers });
}

export async function updateTaskAPI(id, payload, headers) {
  return apiConnector("PUT", task.UPDATE(id), payload, { headers });
}

export async function listTasksForEmployeeAPI(employeeId, headers) {
  return apiConnector("GET", task.LIST_FOR_EMPLOYEE(employeeId), null, { headers });
}

export async function listAllTasksAPI(headers) {
  return apiConnector("GET", task.LIST_ALL, null, { headers });
}