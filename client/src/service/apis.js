
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  LOGOUT_API: BASE_URL + "/auth/logout",
  REFRESH_API: BASE_URL + "/auth/refresh",
}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/image/multi",
  SINGLE_UPLOAD: BASE_URL + "/image/upload",
}

// Phase 2 endpoints: Leave, Attendance, Timesheets
export const leaves = {
  APPLY: BASE_URL + "/leaves", // POST
  BASE: BASE_URL + "/leaves", // for building approve/reject
};

export const attendance = {
  CLOCK_IN: BASE_URL + "/attendance/clock-in", // POST
  CLOCK_OUT: BASE_URL + "/attendance/clock-out", // POST
};

export const timesheets = {
  SUBMIT: BASE_URL + "/timesheets", // POST
  BASE: BASE_URL + "/timesheets", // for building approve/reject
};

// Employees management
export const employees = {
  CREATE: BASE_URL + "/auth/employees", // POST
  LIST: BASE_URL + "/auth/employees", // GET
  GET: (id) => BASE_URL + `/auth/employees/${id}`, // GET
};
