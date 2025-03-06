import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ACCESS_TOKEN } from "../constants";

const api: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

type RequestConfigWithToken = AxiosRequestConfig & {
  headers: { Authorization: string };
};

api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    console.log("interceptors.request 01")

    if (token) {
      console.log("interceptors.request 02")
      // Extend config with token using a type assertion
      return {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
        } as RequestConfigWithToken["headers"],
      };
    } else {
      console.log("interceptors.request 03")
      return config;
    }
  },
  (error) => Promise.reject(error)
);

export default api;