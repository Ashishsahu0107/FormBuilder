import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { publicFormsService } from '@/features/form-builder/services/forms.service'
import { FormRenderer } from '@/features/form-builder/components/FormRenderer'
import type { FormSchema } from '@/features/form-builder/types/schema'

export function PublicFormPage() {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'
  const { slug } = useParams<{ slug: string }>()
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadForm() {
      if (!slug) return
      try {
        const res = await publicFormsService.getForm(slug)
        setSchema(res.data.data.schema)
      } catch (err: any) {
        if (err.response?.status === 404) setError('Form not found or is no longer active.')
        else setError('An error occurred loading the form.')
      } finally {
        setLoading(false)
      }
    }
    loadForm()
  }, [slug])

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!slug) return
    await publicFormsService.submit(slug, { values })
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  if (error) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-lg shadow max-w-md text-center"><h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2><p className="text-gray-500">{error}</p></div></div>
  if (!schema) return null

  return (
    <div className={isEmbed ? 'min-h-screen bg-transparent p-4' : 'min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="h-2 bg-blue-600"></div>
        <div className="p-8 sm:p-12">
          <FormRenderer schema={schema} mode="public" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}