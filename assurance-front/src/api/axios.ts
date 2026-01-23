import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
});


api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (url.startsWith("/api/auth/")) return config;

  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("TOKEN =", localStorage.getItem("token"));

  return config;
});
