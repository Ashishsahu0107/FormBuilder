// Form types
export type FormStatus =
  "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "dropdown"
  | "checkbox"
  | "radio"
  | "file"
  | "signature"
  | "textarea"
  | "rating";

export interface FormField {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  config: Record<string, unknown>;
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  status: FormStatus;
  description?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
