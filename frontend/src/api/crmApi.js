import apiClient from "./client";

export const hcpApi = {
  list: (q = "") => apiClient.get("/hcps", { params: q ? { q } : {} }).then((r) => r.data),
  create: (payload) => apiClient.post("/hcps", payload).then((r) => r.data),
};

export const interactionApi = {
  list: (hcpId) => apiClient.get("/interactions", { params: hcpId ? { hcp_id: hcpId } : {} }).then((r) => r.data),
  create: (payload) => apiClient.post("/interactions", payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/interactions/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/interactions/${id}`),
};

export const chatApi = {
  sendMessage: (payload) => apiClient.post("/chat/message", payload).then((r) => r.data),
};
