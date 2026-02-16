import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => { loadOrders(); }, []);
    const loadOrders = async () => {
        try { const res = await API.get('/orders'); setOrders(res.data); }
        catch { toast.error('Failed to load orders'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}/status`, { status });
            toast.success(`Order ${status.toLowerCase()}`);
            loadOrders();
        } catch { toast.error('Update failed'); }
    };

    const statusColors = { Pending: 'badge-amber', Approved: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green' };

    return (
        <div className="page">
            <div className="page-header"><div><h1>Order Management</h1><p>View and manage incoming orders from distributors</p></div></div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr><th>Order ID</th><th>Distributor</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o._id}>
                                <td className="td-bold">#{o._id.slice(-6).toUpperCase()}</td>
                                <td>
                                    <div>{o.distributorId?.name}</div>
                                    <small className="text-muted">{o.distributorId?.companyName}</small>
                                </td>
                                <td>
                                    {o.items.map((item, i) => (
                                        <div key={i} className="order-item-line">
                                            {item.productId?.name} × {item.quantity}
                                        </div>
                                    ))}
                                </td>
                                <td className="td-bold">₹{o.totalAmount?.toLocaleString()}</td>
                                <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                                <td><span className={`badge ${statusColors[o.status]}`}>{o.status}</span></td>
                                <td>
                                    <select className="status-select" value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan="7" className="empty-table">No orders yet</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
