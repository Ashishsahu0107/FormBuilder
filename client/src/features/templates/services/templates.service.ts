import api from "@/lib/api/client";

export const templatesService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/templates", { params }),
  create: (data: any) => api.post("/templates", data),
};
