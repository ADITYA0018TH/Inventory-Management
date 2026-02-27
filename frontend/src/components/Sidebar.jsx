import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home as FiHome, Package as FiPackage, Layers as FiLayers, ShoppingCart as FiShoppingCart, Box as FiBox, LogOut as FiLogOut, User as FiUser, Search as FiSearch, Users as FiUsers, FileText as FiFileText, Settings as FiSettings, Truck as FiTruck, AlertTriangle as FiAlertTriangle, MessageSquare as FiMessageSquare, Clock as FiClock, Shield as FiShield, Thermometer as FiThermometer, TrendingUp as FiTrendingUp, Clipboard as FiClipboard, MapPin as FiMapPin, Camera as FiCamera, AlertCircle as FiAlertCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        {
            group: 'Overview', items: [
                { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
                { to: '/admin/reports', label: 'Reports', icon: <FiFileText /> },
                { to: '/admin/compliance', label: 'Compliance', icon: <FiShield /> },
                { to: '/admin/forecasting', label: 'Forecasting', icon: <FiTrendingUp /> },
            ]
        },
        {
            group: 'Inventory', items: [
                { to: '/admin/inventory', label: 'Raw Materials', icon: <FiBox /> },
                { to: '/admin/products', label: 'Products', icon: <FiPackage /> },
                { to: '/admin/batches', label: 'Batches', icon: <FiLayers /> },
                { to: '/admin/suppliers', label: 'Suppliers', icon: <FiUsers /> },
                { to: '/admin/warehouses', label: 'Warehouses', icon: <FiMapPin /> },
                { to: '/admin/purchase-orders', label: 'Purchase Orders', icon: <FiClipboard /> },
            ]
        },
        {
            group: 'Operations', items: [
                { to: '/admin/orders', label: 'Orders', icon: <FiShoppingCart /> },
                { to: '/admin/quality', label: 'Quality Control', icon: <FiSearch /> },
                { to: '/admin/shipping', label: 'Shipment Tracking', icon: <FiTruck /> },
                { to: '/admin/returns', label: 'Returns', icon: <FiAlertTriangle /> },
                { to: '/admin/expiry', label: 'Expiry Intelligence', icon: <FiAlertCircle /> },
                { to: '/admin/recalls', label: 'Drug Recalls', icon: <FiAlertTriangle /> },
                { to: '/admin/storage', label: 'Storage Compliance', icon: <FiThermometer /> },
            ]
        },
        {
            group: 'System', items: [
                { to: '/messages', label: 'Messages', icon: <FiMessageSquare /> },
                { to: '/admin/users', label: 'User Management', icon: <FiUser /> },
                { to: '/admin/audit-log', label: 'Audit Log', icon: <FiClock /> },
            ]
        }
    ];

    const distributorLinks = [
        {
            group: 'Menu', items: [
                { to: '/distributor/catalog', label: 'Product Catalog', icon: <FiPackage /> },
                { to: '/distributor/orders', label: 'My Orders', icon: <FiShoppingCart /> },
                { to: '/distributor/returns', label: 'My Returns', icon: <FiAlertTriangle /> },
                { to: '/distributor/verify', label: 'Verify Batch', icon: <FiSearch /> },
                { to: '/distributor/scanner', label: 'QR Scanner', icon: <FiCamera /> },
                { to: '/messages', label: 'Messages', icon: <FiMessageSquare /> },
            ]
        }
    ];

    const roleLinks = user?.role === 'admin' ? adminLinks : distributorLinks;

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/src/assets/logo.png" alt="PharmaLink" className="logo-icon" />
                        <h1>PharmaLink</h1>
                    </div>
                    <button className="mobile-close" onClick={onClose}>&times;</button>
                </div>

                <nav className="sidebar-nav">
                    {roleLinks.map((group, i) => (
                        <div key={i} className="nav-group">
                            <div className="nav-group-title">{group.group}</div>
                            {group.items.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                                    onClick={onClose}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
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
                    <Link to="/profile" className="profile-link" onClick={onClose}>
                        <FiSettings /> <span>Profile</span>
                    </Link>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut /> <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
        </>
    );
}
