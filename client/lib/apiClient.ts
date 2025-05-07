import axios from "axios";
import { config } from "dotenv";
config();
// Create a base axios instance with common configuration
const apiClient = axios.create({
  baseURL: process.env.HOST, // Your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if we are in the browser environment
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
