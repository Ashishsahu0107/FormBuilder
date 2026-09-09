import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formsService } from '@/features/form-builder/services/forms.service'
import { FormBuilder } from '@/features/form-builder/components/FormBuilder'
import { workflowService } from '@/features/form-builder/services/workflow.service'
import type { Form, FormSchema } from '@/features/form-builder/types/schema'

export function BuilderPage() {
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<Form | null>(null)
  const [schema, setSchema] = useState<FormSchema | null>(null)
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
      } catch (err: any) {
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
      alert(err.response?.data?.message || 'Failed to update form status')
    } finally {
      setIsWorkflowLoading(false)
    }
  }

  const handleSave = async (newSchema: FormSchema) => {
    if (!form || !form.currentVersionId) return
    try {
      await formsService.saveSchema(form.id, form.currentVersionId, newSchema)
    } catch (err) {
      console.error('Failed to save schema', err)
      throw err
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading builder...</div>
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  if (!form || !schema) return <div>Form not found or no active version</div>

  return <FormBuilder form={form} initialSchema={schema} onSave={handleSave} onWorkflowAction={handleWorkflowAction} isWorkflowLoading={isWorkflowLoading} />
}