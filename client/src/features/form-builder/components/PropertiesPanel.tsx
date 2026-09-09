import type { FormField } from '../types/schema'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PropertiesPanelProps {
  className?: string
  field: FormField | null
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
}

export function PropertiesPanel({ className, field, onUpdate }: PropertiesPanelProps) {
  if (!field) {
    return (
      <div className={`bg-white border-l border-gray-200 p-6 flex items-center justify-center text-center text-sm text-gray-500 ${className}`}>
        Select a field on the canvas<br/>to edit its properties
      </div>
    )
  }

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          Properties
          <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-200 rounded uppercase">{field.type}</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prop-label">Label</Label>
            <Input id="prop-label" value={field.label} onChange={e => onUpdate(field.id, { label: e.target.value })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prop-desc">Description</Label>
            <Textarea id="prop-desc" value={field.description || ''} onChange={e => onUpdate(field.id, { description: e.target.value })} rows={2} />
          </div>

          {!['heading', 'paragraph', 'divider', 'radio', 'checkbox'].includes(field.type) && (
            <div className="space-y-2">
              <Label htmlFor="prop-placeholder">Placeholder</Label>
              <Input id="prop-placeholder" value={field.placeholder || ''} onChange={e => onUpdate(field.id, { placeholder: e.target.value })} />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Label htmlFor="prop-required" className="cursor-pointer">Required Field</Label>
            <Switch id="prop-required" checked={field.required || false} onCheckedChange={checked => onUpdate(field.id, { required: checked })} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prop-disabled" className="cursor-pointer text-gray-600">Disabled (Read-only)</Label>
            <Switch id="prop-disabled" checked={field.disabled || false} onCheckedChange={checked => onUpdate(field.id, { disabled: checked })} />
          </div>
          
          {['select', 'radio', 'checkbox'].includes(field.type) && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Label>Options</Label>
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={opt.label} onChange={e => {
                    const newOpts = [...(field.options || [])]
                    newOpts[i] = { ...newOpts[i], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                    onUpdate(field.id, { options: newOpts })
                  }} />
                  <button className="text-red-500 text-sm px-2" onClick={() => {
                    const newOpts = (field.options || []).filter((_, idx) => idx !== i)
                    onUpdate(field.id, { options: newOpts })
                  }}>x</button>
                </div>
              ))}
              <button className="text-sm text-blue-600" onClick={() => {
                const newOpts = [...(field.options || []), { label: `Option ${(field.options?.length||0)+1}`, value: `opt_${Date.now()}` }]
                onUpdate(field.id, { options: newOpts })
              }}>+ Add Option</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}