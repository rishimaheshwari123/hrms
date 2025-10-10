
const BASE_URL = "http://localhost:8000/api/v1"
// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  SIGNUP_API: BASE_URL + "/auth/register",
  GET_ALL_EMPLOYEE: BASE_URL + "/auth/getAll",
  GET_SINGLE_EMPLOYEE: BASE_URL + "/auth/get",
  VERIFY_EMPLOYEE: BASE_URL + "/auth/verify",
  UPDATE_EMPLOYEE: BASE_URL + "/auth/update-employee",
}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/images/multi",
}


export const salary = {
  
 CREATE_SALARY: BASE_URL + "/salary/create",
  UPDATE_SALARY: BASE_URL + "/salary/update",
  GET_SALARY: BASE_URL + "/salary/get",

}

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
