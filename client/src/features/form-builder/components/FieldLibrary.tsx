import { useState } from 'react'
import { FIELD_REGISTRY, FIELD_CATEGORIES } from '../constants/field-registry'
import { Search } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

export function FieldLibrary({ className }: { className?: string }) {
  const [search, setSearch] = useState('')

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 ${className}`}>
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {FIELD_CATEGORIES.map(category => {
          const fields = Object.values(FIELD_REGISTRY).filter(
            f => f.category === category.id && f.label.toLowerCase().includes(search.toLowerCase())
          )
          
          if (fields.length === 0) return null
          
          return (
            <div key={category.id}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {fields.map(field => (
                  <LibraryItem key={field.type} field={field} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LibraryItem({ field }: { field: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${field.type}`,
    data: { type: 'LIBRARY_FIELD', fieldType: field.type }
  })
  
  const Icon = field.icon

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-3 gap-2 bg-gray-50 border border-gray-200 rounded-md cursor-grab hover:bg-blue-50 hover:border-blue-300 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Icon className="h-5 w-5 text-gray-600" />
      <span className="text-xs text-gray-700 text-center">{field.label}</span>
    </div>
  )
}