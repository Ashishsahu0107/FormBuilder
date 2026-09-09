import { ArrowLeft, Undo2, Redo2, Eye, Save, Send, CheckCircle, Globe, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { templatesService } from '@/features/templates/services/templates.service'
import { Workflow } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  onWorkflowAction?: (action: 'submit' | 'approve' | 'publish' | 'activate') => void
  onOpenLogic?: () => void
  isWorkflowLoading?: boolean
  schema?: any
}

export function BuilderHeader({ schema, 
  title, status, isSaving, isDirty, canUndo, canRedo, onUndo, onRedo, onPreview, onSave, onWorkflowAction, onOpenLogic, isWorkflowLoading
}: BuilderHeaderProps) {
  const navigate = useNavigate()
  
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title || 'Untitled Form'}</span>
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
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
        
        <Button variant="outline" size="sm" onClick={async () => {
          if (!schema) return
          const title = prompt('Enter template name:', schema.title + ' Template')
          if (!title) return
          try {
            await templatesService.create({ title, category: 'General', schema, description: schema.description })
            alert('Template saved!')
          } catch (e) {
            alert('Failed to save template')
          }
        }} className="gap-2">
          Save as Template
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenLogic} className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
          <Workflow className="h-4 w-4" /> Logic Rules
        </Button>
        <Button variant="outline" size="sm" onClick={onPreview} className="gap-2">
          <Eye className="h-4 w-4" /> Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} disabled={!isDirty || isSaving} className="gap-2">
          <Save className="h-4 w-4" /> Save
        </Button>
        
        {status === 'DRAFT' && (
          <Button size="sm" onClick={() => onWorkflowAction?.('submit')} disabled={isWorkflowLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-4 w-4" /> Submit for Review
          </Button>
        )}
        {status === 'UNDER_REVIEW' && (
          <Button size="sm" onClick={() => onWorkflowAction?.('approve')} disabled={isWorkflowLoading} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="h-4 w-4" /> Approve
          </Button>
        )}
        {status === 'APPROVED' && (
          <Button size="sm" onClick={() => onWorkflowAction?.('publish')} disabled={isWorkflowLoading} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            <Globe className="h-4 w-4" /> Publish
          </Button>
        )}
        {status === 'PUBLISHED' && (
          <Button size="sm" onClick={() => onWorkflowAction?.('activate')} disabled={isWorkflowLoading} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Play className="h-4 w-4" /> Activate Form
          </Button>
        )}
      </div>
    </header>
  )
}