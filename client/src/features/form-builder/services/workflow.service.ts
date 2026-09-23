import api from "@/lib/api/client";

export const workflowService = {
  submitForReview: (formId: string) =>
    api.post(`/forms/${formId}/submit-review`),
  approve: (formId: string) => api.post(`/forms/${formId}/approve`),
  reject: (formId: string, comment: string) =>
    api.post(`/forms/${formId}/reject`, { comment }),
  publish: (formId: string) => api.post(`/forms/${formId}/publish`),
  activate: (formId: string) => api.post(`/forms/${formId}/activate`),
  deactivate: (formId: string) => api.post(`/forms/${formId}/deactivate`),
  archive: (formId: string) => api.post(`/forms/${formId}/archive`),
};
