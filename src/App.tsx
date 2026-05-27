import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { useSingleTab } from '@/hooks/useSingleTab';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AuthCallbackHandler } from '@/pages/AuthCallbackPage';

const App = () => {
  const { initializeAuth, isAuthenticated } = useAuth();
  
  // Custom security hooks
  useInactivityLogout();
  const isDuplicateTab = useSingleTab();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isDuplicateTab) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 bg-opacity-95 p-4 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold">Multiple Tabs Detected</h1>
          <p className="text-gray-300">
            For security reasons, this application can only be opened in a single tab. 
            Please close this tab and return to the active session.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => window.close()}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold hover:bg-red-700 transition-colors"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallbackHandler />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
