import apiClient from "./client";

export const authApi = {
  signup: (payload) => apiClient.post("/auth/signup", payload).then((r) => r.data),
  login: (payload) => apiClient.post("/auth/login", payload).then((r) => r.data),
  me: () => apiClient.get("/auth/me").then((r) => r.data),
};
