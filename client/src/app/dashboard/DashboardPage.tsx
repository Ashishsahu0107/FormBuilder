import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formsService } from '@/features/form-builder/services/forms.service'
import { templatesService } from '@/features/templates/services/templates.service'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Trash, Inbox, Share2, Layers } from 'lucide-react'
import { ShareDialog } from '@/features/form-builder/components/ShareDialog'
import { DeleteFormModal } from '@/features/form-builder/components/DeleteFormModal'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4')
  const [shareSlug, setShareSlug] = useState<string | null>(null)

  // Delete Modal state
  const [formToDelete, setFormToDelete] = useState<any>(null)

  // View Modal state
  const [formToView, setFormToView] = useState<any>(null)

  const { data: templatesData } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: () => templatesService.getAll(),
    enabled: statusFilter === 'TEMPLATES'
  })

  const { data, refetch } = useQuery({
    queryKey: ['forms', statusFilter, user?.id],
    queryFn: () => formsService.getAll(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    enabled: statusFilter !== 'TEMPLATES'
  })

  const handleUseTemplate = async (template: any) => {
    try {
      const res = await formsService.create({ title: template.title + ' (Copy)', schema: template.schema })
      navigate(`/forms/${res.data.data.id}/builder`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async () => {
    if (!newTitle) return
    try {
      const res = await formsService.create({ 
        title: newTitle, 
        schema: { paperSize, elements: [] } 
      })
      setIsCreateOpen(false)
      navigate(`/forms/${res.data.data.id}/builder`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (formId: string) => {
    await formsService.delete(formId)
    refetch()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Form Builder Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/template-editor')} className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
            <Layers className="h-4 w-4" /> Template Editor
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="ALL">All Forms</TabsTrigger>
              <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
              <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
              <TabsTrigger value="ACTIVE">Active</TabsTrigger>
              <TabsTrigger value="TEMPLATES">Templates</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Create Form</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Form Title</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Admission Form 2026" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paper Size</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paperSize" 
                        value="A4" 
                        checked={paperSize === 'A4'} 
                        onChange={() => setPaperSize('A4')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>A4</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="paperSize" 
                        value="A3" 
                        checked={paperSize === 'A3'} 
                        onChange={() => setPaperSize('A3')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span>A3</span>
                    </label>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all">Create & Open Builder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {statusFilter === 'TEMPLATES' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(templatesData?.data.data || []).map((t: any) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-lg text-gray-900">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">{t.description || 'No description'}</p>
                <Button onClick={() => handleUseTemplate(t)} className="w-full" variant="outline">Use Template</Button>
              </div>
            ))}
            {(templatesData?.data.data || []).length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">No templates available yet.</div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data?.data.data || []).map((form: any) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/forms/${form.id}/builder`)}>
                      <div className="font-medium text-gray-900">{form.title}</div>
                      <div className="text-sm text-gray-500">/{form.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={form.status === 'ACTIVE' ? 'default' : form.status === 'DRAFT' ? 'secondary' : 'outline'}>
                        {form.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {form.status === 'ACTIVE' && (
                          <Button variant="ghost" size="icon" onClick={() => setShareSlug(form.slug)} title="Share Form">
                            <Share2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/forms/${form.id}/submissions`)} title="View Submissions">
                          <Inbox className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setFormToView(form)} title="Preview Form">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setFormToDelete(form)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.data.data || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">No forms found. Click "Create Form" to start.</div>
            )}
          </div>
        )}
      </main>
      
      {/* Share Modal */}
      {shareSlug && <ShareDialog formSlug={shareSlug} isOpen={true} onClose={() => setShareSlug(null)} />}

      {/* Delete Confirmation Modal */}
      <DeleteFormModal 
        form={formToDelete} 
        isOpen={!!formToDelete} 
        onClose={() => setFormToDelete(null)} 
        onConfirm={handleDelete} 
      />

      {/* View Form Modal */}
      <Dialog open={!!formToView} onOpenChange={(open) => !open && setFormToView(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Preview: {formToView?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {formToView && (
              <iframe 
                src={`/forms/${formToView.slug}`} 
                className="w-full h-full border-0"
                title="Form Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}