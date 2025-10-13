import { apiConnector } from "./apiConnector";

export const task = {
  CREATE: "http://localhost:8000/api/v1/tasks/create",
  UPDATE: (id) => `http://localhost:8000/api/v1/tasks/${id}`,
  LIST_FOR_EMPLOYEE: (employeeId) => `http://localhost:8000/api/v1/tasks/employee/${employeeId}`,
  LIST_ALL: "http://localhost:8000/api/v1/tasks/all",
};

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