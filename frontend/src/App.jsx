import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Inventory = React.lazy(() => import('./pages/admin/Inventory'));
const Products = React.lazy(() => import('./pages/admin/Products'));
const Batches = React.lazy(() => import('./pages/admin/Batches'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const AuditLog = React.lazy(() => import('./pages/admin/AuditLog'));
const Reports = React.lazy(() => import('./pages/admin/Reports'));
const Suppliers = React.lazy(() => import('./pages/admin/Suppliers'));
const AdminReturns = React.lazy(() => import('./pages/admin/Returns'));
const QualityControl = React.lazy(() => import('./pages/admin/QualityControl'));
const ShipmentTracking = React.lazy(() => import('./pages/admin/ShipmentTracking'));
// New Feature Pages
const ExpiryIntelligence = React.lazy(() => import('./pages/admin/ExpiryIntelligence'));
const Recalls = React.lazy(() => import('./pages/admin/Recalls'));
const StorageCompliance = React.lazy(() => import('./pages/admin/StorageCompliance'));
const Compliance = React.lazy(() => import('./pages/admin/Compliance'));
const Forecasting = React.lazy(() => import('./pages/admin/Forecasting'));
const PurchaseOrders = React.lazy(() => import('./pages/admin/PurchaseOrders'));
const Warehouses = React.lazy(() => import('./pages/admin/Warehouses'));
const SearchResults = React.lazy(() => import('./pages/admin/SearchResults'));

const Catalog = React.lazy(() => import('./pages/distributor/Catalog'));
const DistributorOrders = React.lazy(() => import('./pages/distributor/Orders'));
const VerifyBatch = React.lazy(() => import('./pages/distributor/VerifyBatch'));
const DistributorReturns = React.lazy(() => import('./pages/distributor/Returns'));
const Scanner = React.lazy(() => import('./pages/distributor/Scanner'));
const DistributorAnalytics = React.lazy(() => import('./pages/distributor/Analytics'));

const Messages = React.lazy(() => import('./pages/shared/Messages'));
const Profile = React.lazy(() => import('./pages/shared/Profile'));
const Landing = React.lazy(() => import('./pages/public/Landing'));

import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const getHome = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'quality_inspector') return '/admin/quality';
    if (role === 'warehouse_manager') return '/admin/storage';
    if (role === 'distributor') return '/distributor/catalog';
    return '/';
  };

  return (
    <Suspense fallback={<div className="loading-screen"><div className="spinner"></div></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={getHome(user.role)} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getHome(user.role)} /> : <Register />} />

        {/* Admin + inspector + warehouse Routes */}
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
          <Route path="expiry" element={<ExpiryIntelligence />} />
          <Route path="recalls" element={<Recalls />} />
          <Route path="storage" element={<StorageCompliance />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="search" element={<SearchResults />} />
        </Route>

        {/* Distributor Routes */}
        <Route path="/distributor" element={<ProtectedRoute role="distributor"><Layout /></ProtectedRoute>}>
          <Route path="catalog" element={<Catalog />} />
          <Route path="orders" element={<DistributorOrders />} />
          <Route path="analytics" element={<DistributorAnalytics />} />
          <Route path="returns" element={<DistributorReturns />} />
          <Route path="verify" element={<VerifyBatch />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>

        {/* Shared Routes — messages & profile accessible to all logged-in users */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
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
