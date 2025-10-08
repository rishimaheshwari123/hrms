
const BASE_URL = "http://localhost:8000/api/v1"
// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const endpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
}

export const image = {
  IMAGE_UPLOAD: BASE_URL + "/images/multi",
}
