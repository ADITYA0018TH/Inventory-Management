import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPackage, FiLayers, FiShoppingCart, FiBox, FiLogOut, FiUser, FiSearch, FiUsers, FiFileText, FiSettings } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { to: '/admin/inventory', label: 'Raw Materials', icon: <FiBox /> },
        { to: '/admin/products', label: 'Products', icon: <FiPackage /> },
        { to: '/admin/batches', label: 'Batches', icon: <FiLayers /> },
        { to: '/admin/orders', label: 'Orders', icon: <FiShoppingCart /> },
        { to: '/admin/users', label: 'User Management', icon: <FiUsers /> },
        { to: '/admin/audit-log', label: 'Audit Log', icon: <FiFileText /> },
    ];

    const distributorLinks = [
        { to: '/distributor/catalog', label: 'Product Catalog', icon: <FiPackage /> },
        { to: '/distributor/orders', label: 'My Orders', icon: <FiShoppingCart /> },
        { to: '/distributor/verify', label: 'Verify Batch', icon: <FiSearch /> },
    ];

    const links = user?.role === 'admin' ? adminLinks : distributorLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/src/assets/logo.png" alt="PharmaLink" className="logo-icon" />
                    <h1>PharmaLink</h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <ThemeToggle />
                <div className="user-info">
                    <div className="user-avatar"><FiUser /></div>
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                </div>
                <Link to="/profile" className="profile-link">
                    <FiSettings /> <span>Profile</span>
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
