import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
import { LoginPage } from './app/auth/LoginPage'
import { RegisterPage } from './app/auth/RegisterPage'
import { DashboardPage } from './app/dashboard/DashboardPage'
import { BuilderPage } from './app/forms/BuilderPage'
import { SubmissionsPage } from './app/submissions/SubmissionsPage'
import { PreviewPage } from './app/forms/PreviewPage'
import { PublicFormPage } from './app/public/PublicFormPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60000 } } })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/forms/:id/builder" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
            <Route path="/forms/:id/submissions" element={<ProtectedRoute><SubmissionsPage /></ProtectedRoute>} />
            <Route path="/forms/:id/preview" element={<ProtectedRoute><PreviewPage /></ProtectedRoute>} />
            <Route path="/forms/:slug" element={<PublicFormPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}