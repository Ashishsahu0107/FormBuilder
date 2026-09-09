import api from '@/lib/api/client'
import type { Form, FormVersion, FormSchema } from '../types/schema'

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const formsService = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<PaginatedResponse<Form>>('/forms', { params }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Form }>(`/forms/${id}`),

  create: (data: { title: string; description?: string; category?: string; schema?: any }) =>
    api.post<{ success: boolean; data: Form }>('/forms', data),

  update: (id: string, data: Partial<Form>) =>
    api.patch<{ success: boolean; data: Form }>(`/forms/${id}`, data),

  delete: (id: string) =>
    api.delete(`/forms/${id}`),

  // Versions
  getVersions: (formId: string) =>
    api.get<{ success: boolean; data: FormVersion[] }>(`/forms/${formId}/versions`),

  getVersion: (formId: string, versionId: string) =>
    api.get<{ success: boolean; data: FormVersion }>(`/forms/${formId}/versions/${versionId}`),

  createVersion: (formId: string) =>
    api.post<{ success: boolean; data: FormVersion }>(`/forms/${formId}/versions`),

  saveSchema: (formId: string, versionId: string, schema: FormSchema) =>
    api.patch<{ success: boolean; data: FormVersion }>(`/forms/${formId}/versions/${versionId}`, { schema }),

  // Workflow
  submitForReview: (formId: string) =>
    api.post(`/forms/${formId}/submit-review`),

  approve: (formId: string, comment?: string) =>
    api.post(`/forms/${formId}/approve`, { comment }),

  reject: (formId: string, comment: string) =>
    api.post(`/forms/${formId}/reject`, { comment }),

  publish: (formId: string) =>
    api.post(`/forms/${formId}/publish`),

  activate: (formId: string) =>
    api.post(`/forms/${formId}/activate`),

  deactivate: (formId: string) =>
    api.post(`/forms/${formId}/deactivate`),
}

export const publicFormsService = {
  getForm: (slug: string) =>
    api.get<{ success: boolean; data: { schema: FormSchema; title: string; description?: string } }>(
      `/public/forms/${slug}`
    ),

  submit: (slug: string, data: Record<string, unknown>) =>
    api.post(`/public/forms/${slug}/submit`, data),
}