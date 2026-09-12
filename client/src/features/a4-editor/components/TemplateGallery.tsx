import { useState } from 'react'
import { FORM_TEMPLATES } from '../constants/templates'
import type { FormTemplate } from '../constants/templates'
import { X } from 'lucide-react'

interface TemplateGalleryProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: FormTemplate) => void
}

const CATEGORIES = ['All', ...Array.from(new Set(FORM_TEMPLATES.map(t => t.category)))]

export function TemplateGallery({ isOpen, onClose, onSelect }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('All')

  if (!isOpen) return null

  const filtered = activeCategory === 'All' ? FORM_TEMPLATES : FORM_TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ width: 900, height: 620, maxWidth: '95vw', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-500 mt-1">Start from a pre-built layout or begin with a blank canvas</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-8 py-3 border-b border-gray-100 flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-3 gap-5">
            {filtered.map(template => (
              <button
                key={template.id}
                onClick={() => { onSelect(template); onClose() }}
                className="group flex flex-col border-2 border-gray-100 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                {/* Template preview card */}
                <div
                  className="relative p-5 flex-1"
                  style={{ background: `linear-gradient(135deg, ${template.color}15 0%, ${template.color}05 100%)`, minHeight: 160 }}
                >
                  {/* Miniature lines to represent form fields */}
                  <div className="space-y-2">
                    <div className="h-5 rounded" style={{ backgroundColor: template.color, opacity: 0.85, width: '70%' }} />
                    <div className="h-1.5 bg-gray-200 rounded w-full" />
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex gap-2">
                        <div className="h-7 flex-1 bg-white rounded border border-gray-200 opacity-70" />
                        {i % 2 === 0 && <div className="h-7 flex-1 bg-white rounded border border-gray-200 opacity-70" />}
                      </div>
                    ))}
                  </div>
                  {/* Category badge */}
                  <div
                    className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.category}
                  </div>
                </div>
                {/* Template info */}
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}