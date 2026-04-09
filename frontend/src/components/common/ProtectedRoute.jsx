import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_ROLES = ['admin', 'quality_inspector', 'warehouse_manager'];

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!user) return <Navigate to="/login" />;

    // role="admin" allows all admin-type roles
    if (role === 'admin' && !ADMIN_ROLES.includes(user.role)) return <Navigate to="/" />;
    if (role === 'distributor' && user.role !== 'distributor') return <Navigate to="/" />;

    return children;
}
