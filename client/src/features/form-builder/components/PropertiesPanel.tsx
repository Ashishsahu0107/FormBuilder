import type { FormField, FormSettings } from '../types/schema'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface PropertiesPanelProps {
  className?: string
  field: FormField | null
  settings?: FormSettings
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onUpdateSettings?: (updates: Partial<FormSettings>) => void
}

export function PropertiesPanel({ className, field, settings, onUpdate, onUpdateSettings }: PropertiesPanelProps) {
  if (!field) {
    if (settings && onUpdateSettings) {
      return (
        <div className={`bg-white border-l border-gray-200 flex flex-col h-full ${className}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Form Settings</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <Label>Submit Button Text</Label>
              <Input 
                value={settings.submitButtonText || 'Submit'} 
                onChange={e => onUpdateSettings({ submitButtonText: e.target.value })} 
              />
            </div>
            <div className="space-y-3">
              <Label>Success Message</Label>
              <Textarea 
                value={settings.successMessage || 'Your submission has been received.'} 
                onChange={e => onUpdateSettings({ successMessage: e.target.value })} 
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="space-y-0.5">
                <Label>Multi-Step Form</Label>
                <div className="text-xs text-gray-500">Show each section as a separate page</div>
              </div>
              <Switch checked={!!settings.isMultiStep} onCheckedChange={c => onUpdateSettings({ isMultiStep: c })} />
            </div>
          </div>
        </div>
      )
    }

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
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-3">
          <Label>Label</Label>
          <Input 
            value={field.label} 
            onChange={(e) => onUpdate(field.id, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} 
          />
        </div>

        {field.type !== 'divider' && field.type !== 'spacer' && (
          <div className="space-y-3">
            <Label>Description</Label>
            <Input 
              value={field.description || ''} 
              onChange={(e) => onUpdate(field.id, { description: e.target.value })} 
              placeholder="Help text for the user"
            />
          </div>
        )}

        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea' || field.type === 'number') && (
          <div className="space-y-3">
            <Label>Placeholder</Label>
            <Input 
              value={field.placeholder || ''} 
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })} 
            />
          </div>
        )}

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="space-y-2">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={opt.label} 
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])]
                      newOpts[i] = { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                      onUpdate(field.id, { options: newOpts })
                    }} 
                  />
                  <Button variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => {
                    const newOpts = [...(field.options || [])]
                    newOpts.splice(i, 1)
                    onUpdate(field.id, { options: newOpts })
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                const newOpts = [...(field.options || []), { label: `Option ${(field.options?.length || 0) + 1}`, value: `opt_${Date.now()}` }]
                onUpdate(field.id, { options: newOpts })
              }}>
                <Plus className="w-4 h-4" /> Add Option
              </Button>
            </div>
          </div>
        )}

        {field.type === 'repeater' && (
          <div className="space-y-3">
            <Label>Sub-Fields</Label>
            <div className="space-y-2 border border-gray-200 rounded-md p-3">
              {((field.config?.fields as any[]) || []).map((sf, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={sf.label} 
                    placeholder="Field name"
                    onChange={(e) => {
                      const sfArr = [...((field.config?.fields as any[]) || [])]
                      sfArr[i] = { ...sfArr[i], label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                      onUpdate(field.id, { config: { ...field.config, fields: sfArr } })
                    }} 
                  />
                  <Button variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => {
                    const sfArr = [...((field.config?.fields as any[]) || [])]
                    sfArr.splice(i, 1)
                    onUpdate(field.id, { config: { ...field.config, fields: sfArr } })
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                const sfArr = [...((field.config?.fields as any[]) || [])]
                sfArr.push({ id: `f_${Date.now()}`, type: 'text', label: `Field ${sfArr.length + 1}`, name: `f_${Date.now()}` })
                onUpdate(field.id, { config: { ...field.config, fields: sfArr } })
              }}>
                <Plus className="w-4 h-4" /> Add Sub-Field
              </Button>
            </div>
          </div>
        )}

        {field.type === 'calculation' && (
          <div className="space-y-3">
            <Label>Formula Expression</Label>
            <div className="text-xs text-gray-500 mb-1">Use field names in brackets, e.g. [price] * [quantity]</div>
            <Input 
              value={field.config?.formula as string || ''} 
              onChange={(e) => onUpdate(field.id, { config: { ...field.config, formula: e.target.value } })} 
            />
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Required field</Label>
            <Switch checked={field.required} onCheckedChange={(c) => onUpdate(field.id, { required: c })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Hidden field</Label>
            <Switch checked={field.hidden} onCheckedChange={(c) => onUpdate(field.id, { hidden: c })} />
          </div>
          <div className="space-y-3 pt-2">
            <Label>Width</Label>
            <div className="grid grid-cols-2 gap-2">
              {['full', 'half', 'third'].map(w => (
                <button
                  key={w}
                  onClick={() => onUpdate(field.id, { layout: { ...field.layout, width: w as any } })}
                  className={`px-3 py-1.5 text-xs font-medium rounded border ${field.layout?.width === w || (!field.layout?.width && w === 'full') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {w.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}