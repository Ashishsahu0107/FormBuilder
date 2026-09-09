import { useState } from 'react'
import type { FormSchema, FormSection } from '../types/schema'
import { FieldRenderer } from './fields/FieldRenderer'

interface FormRendererProps {
  schema: FormSchema
  mode?: 'preview' | 'public' | 'canvas'
  onSubmit?: (values: Record<string, unknown>) => void
}

export function FormRenderer({ schema, mode = 'public', onSubmit }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (field.required && !values[field.id]) {
          newErrors[field.id] = `${field.label} is required`
        }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode !== 'public') return
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      await onSubmit?.(values)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
        <p className="text-gray-500">{schema.settings.successMessage || 'Your submission has been received.'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {schema.title && mode !== 'canvas' && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{schema.title}</h1>
          {schema.description && <p className="mt-1 text-gray-500">{schema.description}</p>}
        </div>
      )}
      {schema.sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          mode={mode}
        />
      ))}
      {mode === 'public' && (
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Submitting...' : schema.settings.submitButtonText || 'Submit'}
        </button>
      )}
    </form>
  )
}

function SectionRenderer({ section, values, errors, onChange, mode }: {
  section: FormSection
  values: Record<string, unknown>
  errors: Record<string, string>
  onChange: (fieldId: string, value: unknown) => void
  mode: 'preview' | 'public' | 'canvas'
}) {
  return (
    <div className="space-y-4">
      {section.title && (
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-base font-semibold text-gray-800">{section.title}</h3>
          {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
        </div>
      )}
      <div className={`grid gap-4 ${section.columns === 2 ? 'grid-cols-2' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {section.fields.map(field => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={val => onChange(field.id, val)}
            error={errors[field.id]}
            mode={mode}
          />
        ))}
      </div>
    </div>
  )
}