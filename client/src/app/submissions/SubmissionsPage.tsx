import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { submissionsService } from '@/features/submissions/services/submissions.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function SubmissionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [selectedSub, setSelectedSub] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', id, page],
    queryFn: () => submissionsService.getAll(id!, { page }),
    enabled: !!id
  })

  const handleExport = async () => {
    if (!id) return
    const res = await submissionsService.exportCsv(id)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `submissions-${id}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (isLoading) return <div className="p-8 text-center">Loading submissions...</div>

  const submissions = data?.data?.data || []
  const pagination = data?.data?.pagination

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-xl font-bold">Form Submissions</h1>
        </div>
        <Button onClick={handleExport} className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub: any) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.referenceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedSub(sub)}><Eye className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission: {selectedSub?.referenceNumber}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {selectedSub && JSON.stringify(selectedSub.data, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}