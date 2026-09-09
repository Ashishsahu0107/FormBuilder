import type { FormField } from '../../types/schema'

interface FieldRendererProps {
  field: FormField
  value?: unknown
  onChange?: (value: unknown) => void
  mode?: 'preview' | 'public' | 'canvas'
  error?: string
}

export function FieldRenderer({ field, value, onChange, mode = 'public', error }: FieldRendererProps) {
  const baseClass = 'w-full'
  
  if (field.hidden && mode !== 'canvas') return null

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
    case 'password':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <input
            type={field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : field.type}
            placeholder={field.placeholder}
            value={value as string || ''}
            onChange={e => onChange?.(e.target.value)}
            disabled={field.disabled || mode === 'preview'}
            readOnly={mode === 'canvas'}
            className={`${baseClass} border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <textarea
            placeholder={field.placeholder}
            value={value as string || ''}
            onChange={e => onChange?.(e.target.value)}
            disabled={field.disabled || mode === 'preview'}
            readOnly={mode === 'canvas'}
            rows={(field.config?.rows as number) || 4}
            className={`${baseClass} border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'number':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <input
            type="number"
            placeholder={field.placeholder}
            value={value as number || ''}
            onChange={e => onChange?.(e.target.valueAsNumber)}
            disabled={field.disabled || mode === 'preview'}
            readOnly={mode === 'canvas'}
            min={field.config?.min as number}
            max={field.config?.max as number}
            step={field.config?.step as number}
            className={`${baseClass} border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'select':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <select
            value={value as string || ''}
            onChange={e => onChange?.(e.target.value)}
            disabled={field.disabled || mode === 'preview'}
            className={`${baseClass} border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${error ? 'border-red-500' : ''}`}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {(field.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <div className={`flex ${field.config?.layout === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
            {(field.options || []).map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={field.id} value={opt.value} checked={value === opt.value}
                  onChange={() => onChange?.(opt.value)} disabled={field.disabled || mode === 'preview'} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <div className="flex flex-col gap-2">
            {(field.options || []).map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" value={opt.value}
                  checked={Array.isArray(value) ? (value as string[]).includes(opt.value) : false}
                  onChange={e => {
                    const current = Array.isArray(value) ? (value as string[]) : []
                    onChange?.(e.target.checked ? [...current, opt.value] : current.filter(v => v !== opt.value))
                  }}
                  disabled={field.disabled || mode === 'preview'} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'date':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <input type="date" value={value as string || ''} onChange={e => onChange?.(e.target.value)}
            disabled={field.disabled || mode === 'preview'} readOnly={mode === 'canvas'}
            className={`${baseClass} border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`} />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'file':
    case 'image':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
            {!!field.config?.acceptedTypes && <p className="text-xs text-gray-400 mt-1">{(field.config.acceptedTypes as string[]).join(', ')}</p>}
            {!!field.config?.maxSize && <p className="text-xs text-gray-400">Max {field.config.maxSize as number}MB</p>}
            {mode !== 'canvas' && <input type="file" className="hidden" />}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

    case 'heading':
      const HeadingTag = `h${(field.config?.level as number) || 2}` as 'h1' | 'h2' | 'h3' | 'h4'
      return <HeadingTag className="font-semibold text-gray-800">{String(field.config?.text || field.label)}</HeadingTag>

    case 'paragraph':
      return <p className="text-sm text-gray-600">{String(field.config?.text || field.label)}</p>

    case 'divider':
      return <hr className="border-gray-200" />

    case 'rating':
      const max = (field.config?.max as number) || 5
      const ratingVal = (value as number) || 0
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
              <button key={i} type="button" onClick={() => onChange?.(i + 1)}
                className={`text-2xl ${i < ratingVal ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}>
                ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã…â€œÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )

        case 'repeater':
      const items = Array.isArray(value) ? value : []
      const subFields = (field.config?.fields as FormField[]) || []
      return (
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-start bg-white p-4 border border-gray-200 rounded-md relative">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subFields.map(subField => (
                    <div key={subField.id}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{subField.label}</label>
                      <input 
                        type={subField.type === 'number' ? 'number' : 'text'}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={item[subField.name] || ''}
                        disabled={mode === 'preview' || field.disabled}
                        readOnly={mode === 'canvas'}
                        onChange={e => {
                          const newItems = [...items]
                          newItems[index] = { ...newItems[index], [subField.name]: e.target.value }
                          onChange?.(newItems)
                        }}
                      />
                    </div>
                  ))}
                  {subFields.length === 0 && <span className="text-xs text-gray-400">Configure fields in properties</span>}
                </div>
                {mode !== 'canvas' && (
                  <button type="button" onClick={() => {
                    const newItems = items.filter((_, i) => i !== index)
                    onChange?.(newItems)
                  }} className="text-red-500 hover:text-red-700 font-bold p-1">&times;</button>
                )}
              </div>
            ))}
          </div>
          {mode !== 'canvas' && (
            <button type="button" onClick={() => onChange?.([...items, {}])} className="text-sm text-blue-600 font-medium hover:underline">
              + Add Item
            </button>
          )}
        </div>
      )

    case 'calculation':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 font-mono">
            {value !== undefined ? String(value) : (mode === 'canvas' ? (field.config?.formula as string) || 'No formula' : '0')}
          </div>
        </div>
      )

    default:
      return mode === 'canvas' ? (
        <div className="border border-dashed border-gray-300 rounded p-3 text-sm text-gray-400 text-center">
          {field.type} field
        </div>
      ) : null
  }
}