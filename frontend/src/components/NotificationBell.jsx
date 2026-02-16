import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import API from '../api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

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
                id: `alert-${a._id}`,
                type: 'warning',
                icon: '⚠️',
                title: `Low Stock: ${a.name}`,
                detail: `${a.currentStock} ${a.unit} remaining (Min: ${a.minimumThreshold})`
            }));
            expiringRes.data.forEach(b => items.push({
                id: `exp-${b._id}`,
                type: 'info',
                icon: '⏰',
                title: `Expiring: ${b.batchId}`,
                detail: `${b.productId?.name} — Exp: ${new Date(b.expDate).toLocaleDateString()}`
            }));
            setNotifications(items);
        } catch { /* silent */ }
    };

    return (
        <div className="notification-bell" ref={ref}>
            <button className="bell-btn" onClick={() => setOpen(!open)}>
                <FiBell />
                {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
            </button>
            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        <span className="notification-count">{notifications.length}</span>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="notification-empty">✅ All clear! No alerts.</div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(n => (
                                <div key={n.id} className={`notification-item notification-${n.type}`}>
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
