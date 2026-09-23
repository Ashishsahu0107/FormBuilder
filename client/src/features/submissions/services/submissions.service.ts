import api from "@/lib/api/client";

export const submissionsService = {
  getAll: (
    formId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    return api.get(`/forms/${formId}/submissions`, { params });
  },
  getById: (formId: string, subId: string) => {
    return api.get(`/forms/${formId}/submissions/${subId}`);
  },
  getAnalytics: (formId: string) => {
    return api.get(`/forms/${formId}/submissions/analytics`);
  },
  exportCsv: (
    formId: string,
    params?: { startDate?: string; endDate?: string },
  ) => {
    return api.get(`/forms/${formId}/submissions/export`, {
      params,
      responseType: "blob",
    });
  },
};
