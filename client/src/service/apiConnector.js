import axios from "axios";
import store from "../redux/store"; // fix default import
import { setToken, setUser } from "../redux/authSlice";
import { endpoints } from "./apis";

const { REFRESH_API } = endpoints;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  withCredentials: true, // send cookies (for refresh cookie)
});

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state?.auth?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let subscribers = [];
function onRefreshed(newToken) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}
function addSubscriber(callback) {
  subscribers.push(callback);
}

// Response interceptor: auto refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await axiosInstance.post(REFRESH_API, null, {
          // refresh via cookie, no body
        });
        const newToken = refreshRes?.data?.accessToken || refreshRes?.data?.token;
        if (newToken) {
          store.dispatch(setToken(newToken));
          onRefreshed(newToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        store.dispatch(setToken(null));
        store.dispatch(setUser(null));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
