export type FieldType =
  | 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'url' | 'password'
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'time'
  | 'datetime' | 'file' | 'image' | 'signature' | 'rating' | 'slider'
  | 'address' | 'hidden' | 'heading' | 'paragraph' | 'divider' | 'spacer'
  | 'section' | 'repeater' | 'calculation'

export interface FieldOption {
  label: string
  value: string
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom'
  value?: unknown
  message?: string
}

export interface VisibilityRule {
  conditionOperator: 'ALL' | 'ANY'
  conditions: Condition[]
  action: 'SHOW' | 'HIDE'
}

export interface Condition {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than'
  value?: unknown
}

export interface LogicRule {
  id: string
  conditions: Condition[]
  conditionOperator: 'ALL' | 'ANY'
  actions: LogicAction[]
}

export interface LogicAction {
  type: 'SHOW' | 'HIDE' | 'ENABLE' | 'DISABLE' | 'REQUIRE' | 'SET_VALUE'
  fieldId: string
  value?: unknown
}

export interface FormField {
  id: string
  type: FieldType
  name: string
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  defaultValue?: unknown
  options?: FieldOption[]
  validation?: ValidationRule[]
  visibility?: VisibilityRule[]
  config?: Record<string, unknown>
  layout?: {
    columns?: number
    width?: 'full' | 'half' | 'third' | 'quarter'
  }
}

export interface FormSection {
  id: string
  title?: string
  description?: string
  collapsible?: boolean
  columns?: 1 | 2 | 3 | 4
  fields: FormField[]
}

export interface FormSettings {
  submitButtonText?: string
  successMessage?: string
  redirectUrl?: string
  isMultiStep?: boolean
  steps?: FormStep[]
  theme?: string
  allowedDomains?: string[]
  maxSubmissions?: number
  requireAuth?: boolean
}

export interface FormStep {
  id: string
  title: string
  sectionIds: string[]
}

export interface FormSchema {
  id: string
  version: number
  title: string
  description?: string
  settings: FormSettings
  sections: FormSection[]
  logic: LogicRule[]
}

export type FormStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ACTIVE' | 'DEACTIVATED' | 'ARCHIVED'

export interface Form {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  status: FormStatus
  currentVersionId?: string
  currentVersion?: FormVersion
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FormVersion {
  id: string
  formId: string
  versionNumber: number
  schema: FormSchema
  status: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}