import { useState, useEffect, useRef } from 'react';
import { Bell as FiBell, Check as FiCheck } from 'lucide-react';
import API from '../api';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [dbNotifications, setDbNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const socketRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        loadNotifications();
        loadDbNotifications();
        const interval = setInterval(loadNotifications, 60000);

        // Connect to Socket.io
        try {
            socketRef.current = io('http://localhost:5001', { transports: ['websocket', 'polling'] });
            if (user?.id) {
                socketRef.current.emit('register', user.id);
            }
            socketRef.current.on('notification', (notification) => {
                setDbNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        } catch { /* silent */ }

        return () => {
            clearInterval(interval);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const [alertsRes, expiringRes] = await Promise.all([
                API.get('/raw-materials/alerts'),
                API.get('/batches/expiring')
            ]);
            const items = [];
            alertsRes.data.forEach(a => items.push({
                id: `alert-${a._id}`, type: 'warning', icon: '⚠️',
                title: `Low Stock: ${a.name}`,
                detail: `${a.currentStock} ${a.unit} remaining (Min: ${a.minimumThreshold})`
            }));
            expiringRes.data.forEach(b => items.push({
                id: `exp-${b._id}`, type: 'info', icon: '⏰',
                title: `Expiring: ${b.batchId}`,
                detail: `${b.productId?.name} — Exp: ${new Date(b.expDate).toLocaleDateString()}`
            }));
            setNotifications(items);
        } catch { /* silent */ }
    };

    const loadDbNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setDbNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setUnreadCount(0);
            setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const allItems = [
        ...notifications,
        ...dbNotifications.map(n => ({
            id: n._id, type: n.type === 'order' ? 'info' : 'warning',
            icon: n.type === 'order' ? '📦' : n.type === 'recall' ? '🚨' : '🔔',
            title: n.title, detail: n.message, read: n.read
        }))
    ];
    const totalBadge = notifications.length + unreadCount;

    return (
        <div className="notification-bell" ref={ref}>
            <button className="bell-btn" onClick={() => setOpen(!open)}>
                <FiBell />
                {totalBadge > 0 && <span className="bell-badge">{totalBadge}</span>}
            </button>
            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="notification-count">{totalBadge}</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <FiCheck size={12} /> Mark all read
                                </button>
                            )}
                        </div>
                    </div>
                    {allItems.length === 0 ? (
                        <div className="notification-empty">✅ All clear! No alerts.</div>
                    ) : (
                        <div className="notification-list">
                            {allItems.slice(0, 15).map(n => (
                                <div key={n.id} className={`notification-item notification-${n.type}`} style={{ opacity: n.read ? 0.6 : 1 }}>
                                    <span className="notification-icon">{n.icon}</span>
                                    <div className="notification-text">
                                        <span className="notification-title">{n.title}</span>
                                        <span className="notification-detail">{n.detail}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
