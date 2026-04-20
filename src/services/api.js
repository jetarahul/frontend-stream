// src/services/api.js
import axios from "axios";
import { logInfo, logError } from "../utils/logger";

// ✅ Use your Cloud Run backend-api service URL here
const api = axios.create({
  baseURL: "https://backend-api-820892686232.us-central1.run.app",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(
  (config) => {
    logInfo("API Request", { url: config.url, method: config.method });
    return config;
  },
  (error) => {
    logError("API Request Error", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logInfo("API Response", { url: response.config.url, status: response.status });
    return response;
  },
  (error) => {
    logError("API Response Error", error);
    return Promise.reject(error);
  }
);

export default api;
