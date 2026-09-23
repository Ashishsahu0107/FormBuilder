import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formsService } from '@/features/form-builder/services/forms.service'
import { A4Editor } from '@/features/a4-editor/components/A4Editor'
import { workflowService } from '@/features/form-builder/services/workflow.service'
import type { Form } from '@/features/form-builder/types/schema'
import type { PaperSize } from '@/features/a4-editor/types/element'

export function BuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<Form | null>(null)
  const [schema, setSchema] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(false)

  useEffect(() => {
    async function loadForm() {
      if (!id) return
      try {
        const res = await formsService.getById(id)
        setForm(res.data.data)
        if (res.data.data.currentVersion) {
          setSchema(res.data.data.currentVersion.schema)
        }
      } catch {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }
    loadForm()
  }, [id])

  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'publish' | 'activate') => {
    if (!form) return
    setIsWorkflowLoading(true)
    try {
      if (action === 'submit') await workflowService.submitForReview(form.id)
      if (action === 'approve') await workflowService.approve(form.id)
      if (action === 'publish') await workflowService.publish(form.id)
      if (action === 'activate') await workflowService.activate(form.id)
      // Reload form
      const res = await formsService.getById(form.id)
      setForm(res.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update form status')
    } finally {
      setIsWorkflowLoading(false)
    }
  }

  const handleSave = async (elements: any[], name: string) => {
    if (!form || !form.currentVersionId) return
    try {
      const newSchema = { ...schema, elements }
      await formsService.saveSchema(form.id, form.currentVersionId, newSchema)
      // Update form name if changed
      if (name !== form.title) {
        await formsService.update(form.id, { title: name })
      }
      toast.success('Form saved successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save form')
      throw err
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading builder...</div>
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  if (!form || !schema) return <div className="flex h-screen items-center justify-center">Form not found or no active version</div>

  const paperSize: PaperSize = schema.paperSize || 'A4'
  const initialElements = schema.elements || []

  return (
    <A4Editor 
      templateName={form.title}
      initialElements={initialElements}
      paperSize={paperSize}
      onSave={handleSave}
      onBack={() => navigate('/')}
      onWorkflowAction={handleWorkflowAction}
      isWorkflowLoading={isWorkflowLoading}
      formStatus={form.status}
    />
  )
}