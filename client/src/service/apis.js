
const BASE_URL = "http://localhost:8000/api/v1"
// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  GET_ALL_EMPLOYEE: BASE_URL + "/auth/getAll",
  GET_SINGLE_EMPLOYEE: BASE_URL + "/auth/get",
  VERIFY_EMPLOYEE: BASE_URL + "/auth/verify",
  UPDATE_EMPLOYEE: BASE_URL + "/auth/update-employee",
 SEND_DOC_TO_EMPLOYEE_BY_ADMIN: BASE_URL + "/auth/upload-admin-docs",
 SEND_DOC_BY_EMPLOYEE: BASE_URL + "/auth/upload-emp-docs",
}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/images/multi",
}


export const salary = {
  CREATE_SALARY: BASE_URL + "/salary/create",
  UPDATE_SALARY: BASE_URL + "/salary/update",
  GET_SALARY: BASE_URL + "/salary/get",
  HISTORY: BASE_URL + "/salary/history", // new
};

export const leave = {
  BALANCE: BASE_URL + "/leave/balance",
  APPLY: BASE_URL + "/leave/apply",
  DECISION: BASE_URL + "/leave/decision",
  LIST: BASE_URL + "/leave/list",
}

export const holiday = {
  UPSERT: BASE_URL + "/holiday/upsert",
  DELETE: BASE_URL + "/holiday/delete",
  LIST: BASE_URL + "/holiday/list",
}

// Add payslip endpoints
export const payslip = {
  LIST: BASE_URL + "/payslip/list",
  GENERATE: BASE_URL + "/payslip/generate",
}

// Add payroll endpoints for run & list
export const payroll = {
  RUN: BASE_URL + "/payroll/run",
  LIST: BASE_URL + "/payroll/list",
}

// Timesheet endpoints
export const timesheet = {
  CREATE: BASE_URL + "/timesheet/entry",
  UPDATE: (id) => `${BASE_URL}/timesheet/entry/${id}`,
  MY: BASE_URL + "/timesheet/me",
  ADMIN: BASE_URL + "/timesheet/admin",
  EMPLOYEE: (id) => `${BASE_URL}/timesheet/employee/${id}`,
  UPDATE_ADMIN: (id) => `${BASE_URL}/timesheet/admin/${id}`,
}

export const rules = {
  LIST: BASE_URL + "/rules/list",
  CREATE: BASE_URL + "/rules/create",
  UPDATE: BASE_URL + "/rules/update",
  DELETE: BASE_URL + "/rules/delete",
}
export const task = {
  CREATE: `${BASE_URL}/tasks/create`,
  UPDATE: (id) => `${BASE_URL}/tasks/${id}`,
  LIST_FOR_EMPLOYEE: (employeeId) => `${BASE_URL}/tasks/employee/${employeeId}`,
  LIST_ALL: `${BASE_URL}/tasks/all`,
};
