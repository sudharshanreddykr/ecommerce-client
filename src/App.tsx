import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { useSingleTab } from '@/hooks/useSingleTab';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CustomerHomePage } from '@/pages/CustomerHomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AuthCallbackHandler } from '@/pages/AuthCallbackPage';
import { ShopPage } from '@/pages/ShopPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { RoleHomePage } from '@/pages/RoleHomePage';

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
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          p: 2,
          bgcolor: 'rgba(15,23,42,0.92)',
        }}
      >
        <Card sx={{ maxWidth: 440, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Multiple tabs detected</Typography>
              <Typography color="text.secondary">
                For security reasons, this application can only stay active in one browser tab.
                Close this tab and continue in the active session.
              </Typography>
              <Button variant="contained" color="error" onClick={() => window.close()}>
                Close tab
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
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
        <Route index element={<RoleHomePage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute roles={['admin']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="shop"
          element={
            <ProtectedRoute roles={['user']}>
              <CustomerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="shop/search"
          element={
            <ProtectedRoute roles={['user']}>
              <ShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="shop/products/:id"
          element={
            <ProtectedRoute roles={['user']}>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute roles={['user']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute roles={['user']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment"
          element={
            <ProtectedRoute roles={['user']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute roles={['user']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallbackHandler />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
