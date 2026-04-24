import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Package, Layers, ShoppingCart, Box, LogOut,
    User, FlaskConical, Users, FileText, Settings, Truck,
    AlertTriangle, MessageSquare, Clock, Shield, Thermometer,
    TrendingUp, ClipboardList, Warehouse, Camera, AlertCircle,
    ChevronRight, X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const ROLE_COLORS = {
    admin: { bg: '#eef2ff', color: '#4f46e5', label: 'Administrator' },
    distributor: { bg: '#ecfdf5', color: '#059669', label: 'Distributor' },
    quality_inspector: { bg: '#fff7ed', color: '#ea580c', label: 'Quality Inspector' },
    warehouse_manager: { bg: '#eff6ff', color: '#2563eb', label: 'Warehouse Manager' },
};

const adminLinks = [
    {
        group: 'Overview', items: [
            { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/reports', label: 'Reports', icon: FileText },
            { to: '/admin/compliance', label: 'Compliance', icon: Shield },
            { to: '/admin/forecasting', label: 'Forecasting', icon: TrendingUp },
        ]
    },
    {
        group: 'Inventory', items: [
            { to: '/admin/inventory', label: 'Raw Materials', icon: Box },
            { to: '/admin/products', label: 'Products', icon: Package },
            { to: '/admin/batches', label: 'Batches', icon: Layers },
            { to: '/admin/suppliers', label: 'Suppliers', icon: Users },
            { to: '/admin/warehouses', label: 'Warehouses', icon: Warehouse },
            { to: '/admin/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
        ]
    },
    {
        group: 'Operations', items: [
            { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { to: '/admin/quality', label: 'Quality Control', icon: FlaskConical },
            { to: '/admin/shipping', label: 'Shipment Tracking', icon: Truck },
            { to: '/admin/returns', label: 'Returns', icon: AlertTriangle },
            { to: '/admin/expiry', label: 'Expiry Intelligence', icon: AlertCircle },
            { to: '/admin/recalls', label: 'Drug Recalls', icon: AlertTriangle },
            { to: '/admin/storage', label: 'Storage Compliance', icon: Thermometer },
        ]
    },
    {
        group: 'System', items: [
            { to: '/app/messages', label: 'Messages', icon: MessageSquare },
            { to: '/admin/users', label: 'User Management', icon: User },
            { to: '/admin/audit-log', label: 'Audit Log', icon: Clock },
        ]
    }
];

const qualityInspectorLinks = [
    {
        group: 'Quality', items: [
            { to: '/admin/quality', label: 'Quality Control', icon: FlaskConical },
            { to: '/admin/batches', label: 'Batches', icon: Layers },
        ]
    },
    {
        group: 'System', items: [
            { to: '/app/messages', label: 'Messages', icon: MessageSquare },
        ]
    }
];

const warehouseManagerLinks = [
    {
        group: 'Warehouse', items: [
            { to: '/admin/storage', label: 'Storage Compliance', icon: Thermometer },
            { to: '/admin/inventory', label: 'Raw Materials', icon: Box },
            { to: '/admin/warehouses', label: 'Warehouses', icon: Warehouse },
            { to: '/admin/expiry', label: 'Expiry Intelligence', icon: AlertCircle },
        ]
    },
    {
        group: 'System', items: [
            { to: '/app/messages', label: 'Messages', icon: MessageSquare },
        ]
    }
];

const distributorLinks = [
    {
        group: 'Menu', items: [
            { to: '/distributor/catalog', label: 'Product Catalog', icon: Package },
            { to: '/distributor/orders', label: 'My Orders', icon: ShoppingCart },
            { to: '/distributor/analytics', label: 'My Analytics', icon: TrendingUp },
            { to: '/distributor/returns', label: 'My Returns', icon: AlertTriangle },
            { to: '/distributor/verify', label: 'Verify Batch', icon: FlaskConical },
            { to: '/distributor/scanner', label: 'QR Scanner', icon: Camera },
            { to: '/app/messages', label: 'Messages', icon: MessageSquare },
        ]
    }
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    const roleLinks =
        user?.role === 'admin' ? adminLinks
        : user?.role === 'quality_inspector' ? qualityInspectorLinks
        : user?.role === 'warehouse_manager' ? warehouseManagerLinks
        : distributorLinks;

    const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.distributor;

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const W = isCollapsed ? 64 : 260;

    return (
        <>
            <aside
                className={`sidebar ${isOpen ? 'open' : ''}`}
                style={{
                    width: W,
                    minWidth: W,
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    background: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    transition: 'width 0.25s ease',
                }}
            >
                {/* ── Header ── */}
                <div style={{
                    padding: isCollapsed ? '18px 0 14px' : '18px 16px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    flexShrink: 0,
                    gap: 8,
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <img src="/logo.svg" alt="PharmaLink" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                        </div>
                        {!isCollapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>PharmaLink</div>
                                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.3px' }}>Supply Chain</div>
                            </div>
                        )}
                    </div>

                    {/* Desktop collapse toggle */}
                    {!isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            title="Collapse sidebar"
                            className="desktop-collapse-btn"
                            style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                border: '1px solid #e2e8f0', background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            <PanelLeftClose size={14} />
                        </button>
                    )}

                    {/* Mobile close button */}
                    {!isCollapsed && (
                        <button
                            onClick={onClose}
                            className="sidebar-close-btn"
                            style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                border: '1px solid #e2e8f0', background: 'transparent',
                                display: 'none', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#64748b',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ── Expand button when collapsed (desktop) ── */}
                {isCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                        <button
                            onClick={onToggleCollapse}
                            title="Expand sidebar"
                            className="desktop-collapse-btn"
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                border: '1px solid #e2e8f0', background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <PanelLeftOpen size={15} />
                        </button>
                    </div>
                )}

                {/* ── Nav ── */}
                <nav style={{ flex: 1, padding: isCollapsed ? '8px 6px' : '8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {roleLinks.map((group, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                            {/* Group label — hidden when collapsed */}
                            {!isCollapsed && (
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: '#94a3b8',
                                    textTransform: 'uppercase', letterSpacing: '0.8px',
                                    padding: '10px 10px 4px',
                                }}>
                                    {group.group}
                                </div>
                            )}
                            {isCollapsed && i > 0 && (
                                <div style={{ height: 1, background: '#f1f5f9', margin: '6px 4px' }} />
                            )}

                            {group.items.map(link => {
                                const isActive = location.pathname === link.to;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={onClose}
                                        title={isCollapsed ? link.label : undefined}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            gap: isCollapsed ? 0 : 10,
                                            padding: isCollapsed ? '9px 0' : '8px 10px',
                                            borderRadius: 8,
                                            marginBottom: 1,
                                            textDecoration: 'none',
                                            fontSize: 13.5,
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? '#4f46e5' : '#475569',
                                            background: isActive ? '#eef2ff' : 'transparent',
                                            transition: 'all 0.15s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = '#f8fafc';
                                                e.currentTarget.style.color = '#1e293b';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#475569';
                                            }
                                        }}
                                    >
                                        {/* Active bar */}
                                        {isActive && !isCollapsed && (
                                            <div style={{
                                                position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                                width: 3, borderRadius: '0 3px 3px 0',
                                                background: '#6366f1',
                                            }} />
                                        )}

                                        <Icon
                                            size={isCollapsed ? 18 : 16}
                                            style={{
                                                color: isActive ? '#6366f1' : '#94a3b8',
                                                flexShrink: 0,
                                                transition: 'color 0.15s',
                                            }}
                                        />

                                        {!isCollapsed && (
                                            <>
                                                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{link.label}</span>
                                                {isActive && (
                                                    <ChevronRight size={12} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                                                )}
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ── Footer ── */}
                <div style={{
                    padding: isCollapsed ? '10px 6px' : '12px 12px',
                    borderTop: '1px solid #f1f5f9',
                    flexShrink: 0,
                }}>
                    {isCollapsed ? (
                        /* Collapsed footer — just avatar + logout icon */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div
                                title={user?.name}
                                style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: `linear-gradient(135deg, ${roleStyle.color}, ${roleStyle.color}99)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'default',
                                }}
                            >
                                {initials}
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                style={{
                                    width: 34, height: 34, borderRadius: 8,
                                    border: '1px solid #e2e8f0', background: 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    ) : (
                        /* Expanded footer */
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 10px',
                                borderRadius: 10,
                                background: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                marginBottom: 8,
                            }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    background: `linear-gradient(135deg, ${roleStyle.color}, ${roleStyle.color}99)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: 13, fontWeight: 700,
                                }}>
                                    {initials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.name}
                                    </div>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center',
                                        fontSize: 10, fontWeight: 600,
                                        color: roleStyle.color, background: roleStyle.bg,
                                        padding: '1px 6px', borderRadius: 20, marginTop: 2,
                                    }}>
                                        {roleStyle.label}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                                <Link
                                    to="/app/profile"
                                    onClick={onClose}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: 6, padding: '8px 0',
                                        borderRadius: 8, border: '1px solid #e2e8f0',
                                        background: '#fff', color: '#475569',
                                        fontSize: 12, fontWeight: 500, textDecoration: 'none',
                                        transition: 'all 0.15s', cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                                >
                                    <Settings size={13} /> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: 6, padding: '8px 0',
                                        borderRadius: 8, border: '1px solid #e2e8f0',
                                        background: '#fff', color: '#475569',
                                        fontSize: 12, fontWeight: 500,
                                        transition: 'all 0.15s', cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff'; }}
                                >
                                    <LogOut size={13} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* Mobile overlay */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        </>
    );
}
