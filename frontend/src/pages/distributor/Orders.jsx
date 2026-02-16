import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiFileText, FiDownload } from 'react-icons/fi';

export default function DistributorOrders() {
    const [orders, setOrders] = useState([]);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        API.get('/orders').then(res => setOrders(res.data)).catch(() => toast.error('Failed to load orders'));
    }, []);

    const viewInvoice = async (order) => {
        try {
            const res = await API.get(`/orders/${order._id}/invoice`);
            setInvoiceData(res.data);
            setIsInvoiceOpen(true);
        } catch (err) {
            toast.error('Failed to load invoice');
        }
    };

    const printInvoice = () => {
        window.print();
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Order History</h1>
                <p>Track status of your orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="card"><div className="empty-state">You haven't placed any orders yet</div></div>
            ) : (
                <div className="grid-list">
                    {orders.map(o => (
                        <div key={o._id} className="card order-card">
                            <div className="card-header">
                                <div>
                                    <h3>{o.invoiceNumber || o._id.slice(-6).toUpperCase()}</h3>
                                    <span className="text-muted">{new Date(o.orderDate).toLocaleDateString()}</span>
                                </div>
                                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                            </div>
                            <div className="card-body">
                                <div className="order-items">
                                    {o.items.map((item, i) => (
                                        <div key={i} className="order-item">
                                            <span>{item.productId?.name}</span>
                                            <span>× {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="total-amount">Total: ₹{o.totalAmount?.toLocaleString()}</div>
                                <div className="tracking-preview mt-4">
                                    {o.tracking?.length > 0 && (
                                        <div className="text-sm">
                                            <span className="text-muted">Latest Update: </span>
                                            <strong>{o.tracking[o.tracking.length - 1].status}</strong>
                                            <span className="text-muted"> - {o.tracking[o.tracking.length - 1].location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn-icon" onClick={() => viewInvoice(o)} title="View Invoice"><FiFileText /></button>
                                {o.status === 'Shipped' && (
                                    <button className="btn btn-sm btn-outline">Track Shipment</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isInvoiceOpen && invoiceData && (
                <div className="modal-overlay" onClick={() => setIsInvoiceOpen(false)}>
                    <div className="invoice-modal" onClick={e => e.stopPropagation()}>
                        <div className="invoice-header">
                            <div>
                                <h1>INVOICE</h1>
                                <p>#{invoiceData.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <h2>PharmaLink</h2>
                                <p>123 Pharma Park, Ind Area</p>
                                <p>Mumbai, MH 400001</p>
                            </div>
                        </div>
                        <hr />
                        <div className="invoice-details grid-2">
                            <div>
                                <h4>Bill To:</h4>
                                <p>{invoiceData.distributor?.companyName}</p>
                                <p>{invoiceData.distributor?.name}</p>
                                <p>{invoiceData.distributor?.address}</p>
                                <p>GST: {invoiceData.distributor?.gstNumber || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>Date:</strong> {new Date(invoiceData.orderDate).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {invoiceData.status}</p>
                            </div>
                        </div>
                        <table className="invoice-table mt-4">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Batch</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.name} <small>({item.sku})</small></td>
                                        <td>{item.batchId || '-'}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.unitPrice}</td>
                                        <td>₹{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" className="text-right"><strong>Grand Total:</strong></td>
                                    <td><strong>₹{invoiceData.totalAmount?.toLocaleString()}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="invoice-footer mt-8 text-center no-print">
                            <button className="btn btn-primary" onClick={printInvoice}>Print Invoice</button>
                            <button className="btn btn-secondary ml-2" onClick={() => setIsInvoiceOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
