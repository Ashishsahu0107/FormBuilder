import { ArrowLeft, Undo2, Redo2, Eye, Save, Send, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BuilderHeaderProps {
  formId: string
  title: string
  status: string
  isSaving: boolean
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onPreview: () => void
  onSave: () => void
}

export function BuilderHeader({
  title, status, isSaving, isDirty, canUndo, canRedo, onUndo, onRedo, onPreview, onSave
}: BuilderHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title || 'Untitled Form'}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
              {status}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <Button variant="ghost" size="icon" disabled={!canUndo} onClick={onUndo}>
            <Undo2 className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" disabled={!canRedo} onClick={onRedo}>
            <Redo2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={onPreview} className="gap-2">
          <Eye className="h-4 w-4" /> Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} disabled={!isDirty || isSaving} className="gap-2">
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Send className="h-4 w-4" /> Submit for Review
        </Button>
      </div>
    </header>
  )
}