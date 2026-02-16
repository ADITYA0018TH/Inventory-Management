import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Products from './pages/admin/Products';
import Batches from './pages/admin/Batches';
import AdminOrders from './pages/admin/Orders';
import UserManagement from './pages/admin/UserManagement';
import AuditLog from './pages/admin/AuditLog';
import Catalog from './pages/distributor/Catalog';
import DistributorOrders from './pages/distributor/Orders';
import VerifyBatch from './pages/distributor/VerifyBatch';
import Profile from './pages/Profile';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog'} /> : <Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="products" element={<Products />} />
        <Route path="batches" element={<Batches />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="audit-log" element={<AuditLog />} />
      </Route>

      {/* Distributor Routes */}
      <Route path="/distributor" element={<ProtectedRoute role="distributor"><Layout /></ProtectedRoute>}>
        <Route path="catalog" element={<Catalog />} />
        <Route path="orders" element={<DistributorOrders />} />
        <Route path="verify" element={<VerifyBatch />} />
      </Route>

      {/* Shared Routes */}
      <Route path="/profile" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid #333' },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e1e2e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e1e2e' } },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
