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
import Reports from './pages/admin/Reports';
import Suppliers from './pages/admin/Suppliers';
import AdminReturns from './pages/admin/Returns';
import QualityControl from './pages/admin/QualityControl';
import ShipmentTracking from './pages/admin/ShipmentTracking';
// New Feature Pages
import ExpiryIntelligence from './pages/admin/ExpiryIntelligence';
import Recalls from './pages/admin/Recalls';
import StorageCompliance from './pages/admin/StorageCompliance';
import Compliance from './pages/admin/Compliance';
import Forecasting from './pages/admin/Forecasting';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import Warehouses from './pages/admin/Warehouses';

import Catalog from './pages/distributor/Catalog';
import DistributorOrders from './pages/distributor/Orders';
import VerifyBatch from './pages/distributor/VerifyBatch';
import DistributorReturns from './pages/distributor/Returns';
import Scanner from './pages/distributor/Scanner';

import Messages from './pages/Messages';
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
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="products" element={<Products />} />
        <Route path="batches" element={<Batches />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="quality" element={<QualityControl />} />
        <Route path="shipping" element={<ShipmentTracking />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="audit-log" element={<AuditLog />} />
        {/* New Feature Routes */}
        <Route path="expiry" element={<ExpiryIntelligence />} />
        <Route path="recalls" element={<Recalls />} />
        <Route path="storage" element={<StorageCompliance />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="forecasting" element={<Forecasting />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="warehouses" element={<Warehouses />} />
      </Route>

      {/* Distributor Routes */}
      <Route path="/distributor" element={<ProtectedRoute role="distributor"><Layout /></ProtectedRoute>}>
        <Route path="catalog" element={<Catalog />} />
        <Route path="orders" element={<DistributorOrders />} />
        <Route path="returns" element={<DistributorReturns />} />
        <Route path="verify" element={<VerifyBatch />} />
        <Route path="scanner" element={<Scanner />} />
      </Route>

      {/* Shared Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <div data-motion="subtle">
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 16px 32px rgba(2, 6, 23, 0.28)'
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
          }} />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
