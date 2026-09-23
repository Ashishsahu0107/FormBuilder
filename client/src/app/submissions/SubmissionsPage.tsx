import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { submissionsService } from '@/features/submissions/services/submissions.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Eye, Activity, List } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function SubmissionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('data')

  const { data: subsQuery, isLoading: isSubsLoading } = useQuery({
    queryKey: ['submissions', id, page],
    queryFn: () => submissionsService.getAll(id!, { page }),
    enabled: !!id
  })

  const { data: analyticsQuery } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => submissionsService.getAnalytics(id!),
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

  if (isSubsLoading) return <div className="p-8 text-center">Loading...</div>

  const submissions = subsQuery?.data?.data || []
  const pagination = subsQuery?.data?.pagination
  const analytics = analyticsQuery?.data?.data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-xl font-bold">Form Submissions</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="data" className="gap-2"><List className="w-4 h-4" /> Data</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><Activity className="w-4 h-4" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto overflow-y-hidden">
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
                      <td colSpan={4} className="p-0">
                        <EmptyState title="No Submissions Yet" description="This form hasn't received any submissions." />
                      </td>
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
          </TabsContent>

          <TabsContent value="analytics">
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Total Views</div>
                    <div className="text-4xl font-black text-gray-900">{analytics.views}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Total Submissions</div>
                    <div className="text-4xl font-black text-blue-600">{analytics.totalSubmissions}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Conversion Rate</div>
                    <div className="text-4xl font-black text-green-600">{analytics.conversionRate}%</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-800 mb-6">Submissions over last 30 days</h3>
                  <div className="h-72 w-full">
                    {analytics.dailySubmissions.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.dailySubmissions}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">Not enough data to display chart</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Loading analytics...</div>
            )}
          </TabsContent>
        </Tabs>
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