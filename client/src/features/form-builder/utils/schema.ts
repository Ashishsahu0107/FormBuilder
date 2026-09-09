import type { FormField, FormSection, FormSchema } from '../types/schema'

export function generateId(prefix = 'field'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
}

export function createDefaultField(type: string): FormField {
  const id = generateId('field')
  const base: FormField = {
    id,
    type: type as FormField['type'],
    name: id,
    label: getDefaultLabel(type),
  }

  switch (type) {
    case 'select':
    case 'radio':
    case 'checkbox':
    case 'multiselect':
      return { ...base, options: [{ label: 'Option 1', value: 'option_1' }] }
    case 'heading':
      return { ...base, config: { level: 2, text: 'Section Heading' } }
    case 'paragraph':
      return { ...base, config: { text: 'Add your description here.' } }
    case 'rating':
      return { ...base, config: { max: 5 } }
    case 'file':
    case 'image':
      return { ...base, config: { maxSize: 5, acceptedTypes: ['.pdf', '.jpg', '.png'], maxFiles: 1 } }
    case 'textarea':
      return { ...base, placeholder: 'Enter text...', config: { rows: 4 } }
    case 'number':
      return { ...base, placeholder: '0' }
    case 'email':
      return { ...base, placeholder: 'email@example.com' }
    case 'phone':
      return { ...base, placeholder: '+91 9876543210' }
    case 'url':
      return { ...base, placeholder: 'https://' }
    default:
      return base
  }
}

export function createDefaultSection(): FormSection {
  return {
    id: generateId('section'),
    title: 'New Section',
    fields: [],
  }
}

export function createEmptySchema(title: string): FormSchema {
  return {
    id: generateId('form'),
    version: 1,
    title,
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
    },
    sections: [{ id: generateId('section'), title: '', fields: [] }],
    logic: [],
  }
}

function getDefaultLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Text Field',
    textarea: 'Long Text',
    number: 'Number',
    email: 'Email',
    phone: 'Phone',
    url: 'URL',
    password: 'Password',
    select: 'Dropdown',
    multiselect: 'Multi-Select',
    radio: 'Radio Group',
    checkbox: 'Checkbox Group',
    date: 'Date',
    time: 'Time',
    datetime: 'Date & Time',
    file: 'File Upload',
    image: 'Image Upload',
    signature: 'Signature',
    rating: 'Rating',
    slider: 'Slider',
    address: 'Address',
    hidden: 'Hidden Field',
    heading: 'Heading',
    paragraph: 'Paragraph',
    divider: 'Divider',
    spacer: 'Spacer',
    section: 'Section',
    repeater: 'Repeater',
    calculation: 'Calculation',
  }
  return labels[type] || 'Field'
}