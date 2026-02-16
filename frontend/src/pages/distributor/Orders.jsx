import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';

export default function DistributorOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        API.get('/orders').then(res => setOrders(res.data)).catch(() => toast.error('Failed to load orders'));
    }, []);

    const statusColors = { Pending: 'badge-amber', Approved: 'badge-blue', Shipped: 'badge-purple', Delivered: 'badge-green' };

    return (
        <div className="page">
            <div className="page-header"><div><h1>Order History</h1><p>Track status of your orders</p></div></div>

            {orders.length === 0 ? (
                <div className="card"><div className="empty-state">You haven't placed any orders yet</div></div>
            ) : (
                <div className="orders-list">
                    {orders.map(o => (
                        <div key={o._id} className="card order-card">
                            <div className="order-card-header">
                                <div>
                                    <h3>Order #{o._id.slice(-6).toUpperCase()}</h3>
                                    <span className="text-muted">{new Date(o.orderDate).toLocaleDateString()}</span>
                                </div>
                                <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
                            </div>
                            <div className="order-items">
                                {o.items.map((item, i) => (
                                    <div key={i} className="order-item-row">
                                        <span>{item.productId?.name} ({item.productId?.type})</span>
                                        <span>× {item.quantity}</span>
                                        <span>₹{(item.productId?.pricePerUnit * item.quantity)?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-card-footer">
                                <span className="order-total">Total: ₹{o.totalAmount?.toLocaleString()}</span>
                                <div className="order-timeline">
                                    {['Pending', 'Approved', 'Shipped', 'Delivered'].map((s, i) => (
                                        <div key={s} className={`timeline-step ${['Pending', 'Approved', 'Shipped', 'Delivered'].indexOf(o.status) >= i ? 'active' : ''}`}>
                                            <div className="timeline-dot"></div>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
