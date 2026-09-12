import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { A4Editor } from '@/features/a4-editor/components/A4Editor'
import { templatesService } from '@/features/templates/services/templates.service'
import { useQuery } from '@tanstack/react-query'

export function TemplateEditorPage() {
  const navigate = useNavigate()
  const { templateId } = useParams<{ templateId?: string }>()

  const { data: templateData } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null
      const res = await templatesService.getAll()
      const templates = res.data.data as any[]
      return templates.find(t => t.id === templateId) || null
    },
    enabled: !!templateId,
  })

  const handleSave = async (elements: any[], name: string) => {
    try {
      await templatesService.create({
        title: name,
        category: 'Custom',
        description: 'Created with A4 Template Editor',
        schema: { elements },
      })
      toast.success('Template saved successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save template')
    }
  }

  const initialElements = templateData?.schema?.elements || []
  const templateName = templateData?.title || 'Untitled Form'

  return (
    <A4Editor
      templateName={templateName}
      initialElements={initialElements}
      onSave={handleSave}
      onBack={() => navigate('/')}
    />
  )
}