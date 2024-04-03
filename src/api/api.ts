import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ACCESS_TOKEN } from "../constants";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
});

type RequestConfigWithToken = AxiosRequestConfig & {
  headers: { Authorization: string };
};

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // Extend config with token using a type assertion
      return {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
        } as RequestConfigWithToken["headers"],
      };
    } else {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

export default api;
