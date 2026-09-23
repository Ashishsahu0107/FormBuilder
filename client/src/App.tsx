import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { LoginPage } from "./app/auth/LoginPage";
import { RegisterPage } from "./app/auth/RegisterPage";
import { ForgotPasswordPage } from "./app/auth/ForgotPasswordPage";
import { DashboardPage } from "./app/dashboard/DashboardPage";
import { BuilderPage } from "./app/forms/BuilderPage";
import { SubmissionsPage } from "./app/submissions/SubmissionsPage";
import { PreviewPage } from "./app/forms/PreviewPage";
import { PublicFormPage } from "./app/public/PublicFormPage";
import { TemplateEditorPage } from "./app/template-editor/TemplateEditorPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: "#333", color: "#fff" } }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            `n{" "}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            `n
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:id/builder"
              element={
                <ProtectedRoute>
                  <BuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:id/submissions"
              element={
                <ProtectedRoute>
                  <SubmissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:id/preview"
              element={
                <ProtectedRoute>
                  <PreviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/template-editor"
              element={
                <ProtectedRoute>
                  <TemplateEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/template-editor/:templateId"
              element={
                <ProtectedRoute>
                  <TemplateEditorPage />
                </ProtectedRoute>
              }
            />
            <Route path="/forms/:slug" element={<PublicFormPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
