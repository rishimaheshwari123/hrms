import axios from "axios";

export const axiosInstance = axios.create({});
export const apiConnector = (method, url, bodyData, headers, params, config) => {
  // Normalize headers to support both { Authorization: ... } and { headers: { Authorization: ... } }
  const normalizedHeaders = headers
    ? (headers.headers ? headers.headers : headers)
    : null;

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: normalizedHeaders,
    params: params ? params : null,
    ...(config || {}), // allow passing axios config such as responseType
  });
};
