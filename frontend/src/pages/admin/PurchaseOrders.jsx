import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiCheck, FiSend, FiPackage } from 'react-icons/fi';

export default function PurchaseOrders() {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await API.get('/purchase-orders');
            setPOs(res.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const autoGenerate = async () => {
        setGenerating(true);
        try {
            const res = await API.post('/purchase-orders/auto-generate');
            toast.success(res.data.message);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate');
        }
        setGenerating(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/purchase-orders/${id}/status`, { status });
            toast.success(`PO ${status.toLowerCase()}`);
            loadData();
        } catch { toast.error('Failed to update'); }
    };

    const statusConfig = {
        Draft: { color: 'Pending', icon: <FiShoppingBag /> },
        Approved: { color: 'Approved', icon: <FiCheck /> },
        Sent: { color: 'Shipped', icon: <FiSend /> },
        Received: { color: 'Delivered', icon: <FiPackage /> }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>📋 Purchase Orders</h2>
                <button className="btn btn-primary" onClick={autoGenerate} disabled={generating}>
                    {generating ? 'Generating...' : '⚡ Auto-Generate from Low Stock'}
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>PO Number</th><th>Supplier</th><th>Items</th><th>Total</th>
                            <th>Status</th><th>Created</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No purchase orders yet. Click "Auto-Generate" to create from low stock alerts.</td></tr>
                        ) : pos.map(po => (
                            <tr key={po._id}>
                                <td><strong>{po.poNumber}</strong></td>
                                <td>{po.supplierId?.name}</td>
                                <td>
                                    {po.items?.map((item, i) => (
                                        <div key={i} style={{ fontSize: 12 }}>
                                            {item.materialId?.name} × {item.quantity} {item.unit}
                                        </div>
                                    ))}
                                </td>
                                <td>₹{po.totalAmount?.toLocaleString() || '0'}</td>
                                <td>
                                    <span className={`status-badge status-${statusConfig[po.status]?.color}`}>
                                        {statusConfig[po.status]?.icon} {po.status}
                                    </span>
                                </td>
                                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {po.status === 'Draft' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(po._id, 'Approved')}>Approve</button>
                                    )}
                                    {po.status === 'Approved' && (
                                        <button className="btn btn-sm" onClick={() => updateStatus(po._id, 'Sent')}>Mark Sent</button>
                                    )}
                                    {po.status === 'Sent' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(po._id, 'Received')}>Received</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pos.some(p => p.notes) && (
                <div className="card" style={{ marginTop: 16 }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        💡 <strong>Tip:</strong> Auto-generated POs are created as "Draft" for materials below minimum threshold, matched to their linked suppliers. Approve → Send → Mark as Received to auto-restock inventory.
                    </p>
                </div>
            )}
        </div>
    );
}
