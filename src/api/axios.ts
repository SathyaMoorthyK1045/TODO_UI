import axios from "axios";

const api = axios.create({
  baseURL: "https://todo-api-sathya-aqdke9fycteqegdh.centralindia-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
