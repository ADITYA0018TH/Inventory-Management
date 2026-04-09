import { useState, useEffect } from 'react';
import API, { getBaseURL } from '../../api';
import { Check, Truck, X, FileText, Download, ShoppingCart, Clock, Package, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

const STATUS_CONFIG = {
    Pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    Approved:  { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    Shipped:   { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    Delivered: { color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0' },
    Cancelled: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0' };
    return (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {status}
        </span>
    );
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [batches, setBatches] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [ordersRes, batchesRes] = await Promise.all([API.get('/orders'), API.get('/batches')]);
            setOrders(ordersRes.data); setBatches(batchesRes.data);
        } catch { toast.error('Failed to load data'); }
    };

    const updateStatus = async (id, status) => {
        try { await API.put(`/orders/${id}/status`, { status }); toast.success(`Order ${status}`); loadData(); }
        catch { toast.error('Update failed'); }
    };

    const handleAssignBatch = async () => {
        try {
            await API.put(`/orders/${selectedOrder._id}/assign-batch`, { itemIndex: selectedItemIndex, batchId: selectedBatchId });
            toast.success('Batch assigned'); setIsAssignModalOpen(false); loadData();
        } catch { toast.error('Assignment failed'); }
    };

    const viewInvoice = async (order) => {
        try { const res = await API.get(`/orders/${order._id}/invoice`); setInvoiceData(res.data); setIsInvoiceOpen(true); }
        catch { toast.error('Failed to load invoice'); }
    };

    const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {});
    const totalRevenue = orders.filter(o => ['Delivered', 'Shipped'].includes(o.status)).reduce((s, o) => s + (o.totalAmount || 0), 0);

    const filtered = orders.filter(o => {
        const matchSearch = !search || (o.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) || (o.distributorId?.companyName || o.distributorId?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Order Management</h1>
                    <p>Review, approve, and ship distributor orders</p>
                </div>
                <button className="btn btn-ghost" onClick={() => window.open(`${getBaseURL()}/api/export/orders`, '_blank')}>
                    <Download size={15} /> Export CSV
                </button>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) 1.4fr', gap: 12, marginBottom: 20 }}>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <div key={status} onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
                        style={{ background: filterStatus === status ? cfg.bg : '#fff', border: `1px solid ${filterStatus === status ? cfg.border : '#e2e8f0'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{counts[status] || 0}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{status}</div>
                    </div>
                ))}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShoppingCart size={16} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>₹{totalRevenue.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Revenue</div>
                    </div>
                </div>
            </div>

            {/* Search + filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice or distributor..."
                        style={{ paddingLeft: 32, height: 36, width: '100%', boxSizing: 'border-box', fontSize: 13, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} />
                </div>
                {filterStatus && (
                    <button onClick={() => setFilterStatus('')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6366f1', background: '#ede9fe', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
                        <X size={12} /> Clear filter
                    </button>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length} orders</span>
            </div>

            {/* Orders table */}
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Distributor</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o._id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: 13 }}>
                                        {o.invoiceNumber || o._id.slice(-8).toUpperCase()}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{o.distributorId?.companyName || o.distributorId?.name || '—'}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.distributorId?.name}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {o.items.slice(0, 2).map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                                <span style={{ color: '#475569' }}>{item.productId?.name}</span>
                                                <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4 }}>×{item.quantity}</span>
                                                {item.batchId && <span style={{ background: '#ede9fe', color: '#6366f1', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4 }}>{item.batchId}</span>}
                                                {!item.batchId && o.status === 'Pending' && (
                                                    <button onClick={() => { setSelectedOrder(o); setSelectedItemIndex(i); setIsAssignModalOpen(true); }}
                                                        style={{ fontSize: 10, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontWeight: 600 }}>
                                                        Assign
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {o.items.length > 2 && <div style={{ fontSize: 11, color: '#94a3b8' }}>+{o.items.length - 2} more</div>}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>₹{o.totalAmount?.toLocaleString()}</td>
                                <td style={{ fontSize: 12, color: '#64748b' }}>
                                    <div>{new Date(o.orderDate).toLocaleDateString()}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(o.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td><StatusBadge status={o.status} /></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <button onClick={() => viewInvoice(o)} title="View Invoice"
                                            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={13} />
                                        </button>
                                        <button onClick={() => { const token = localStorage.getItem('token'); window.open(`${getBaseURL()}/api/invoice/${o._id}/pdf?token=${token}`, '_blank'); }} title="Download PDF"
                                            style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Download size={13} />
                                        </button>
                                        {o.status === 'Pending' && (
                                            <>
                                                <button onClick={() => updateStatus(o._id, 'Approved')} title="Approve"
                                                    style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Check size={13} />
                                                </button>
                                                <button onClick={() => updateStatus(o._id, 'Cancelled')} title="Cancel"
                                                    style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <X size={13} />
                                                </button>
                                            </>
                                        )}
                                        {o.status === 'Approved' && (
                                            <button onClick={() => updateStatus(o._id, 'Shipped')}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 7, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                                <Truck size={12} /> Ship
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <ShoppingCart size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                                    {search || filterStatus ? 'No orders match your filter' : 'No orders yet'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assign batch modal */}
            <Modal open={isAssignModalOpen} setOpen={setIsAssignModalOpen}>
                <ModalBody>
                    <ModalContent style={{ maxWidth: 400 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Assign Batch</h3>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Select a released batch to assign to this order item</p>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger><SelectValue placeholder="Select released batch..." /></SelectTrigger>
                            <SelectContent>
                                {batches.filter(b => b.status === 'Released').map(b => (
                                    <SelectItem key={b.batchId} value={b.batchId}>{b.batchId} — {b.productId?.name} ({b.quantityProduced} units)</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ModalFooter style={{ background: 'transparent', border: 'none', paddingTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssignBatch}>Assign Batch</button>
                        </ModalFooter>
                    </ModalContent>
                </ModalBody>
            </Modal>

            {/* Invoice modal */}
            {isInvoiceOpen && invoiceData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsInvoiceOpen(false)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>INVOICE</div>
                                <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginTop: 2 }}>#{invoiceData.invoiceNumber}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>PharmaLink</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>123 Pharma Park, Mumbai</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Bill To</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{invoiceData.distributor?.companyName}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>{invoiceData.distributor?.name}</div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>GST: {invoiceData.distributor?.gstNumber || 'N/A'}</div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Details</div>
                                <div style={{ fontSize: 12, color: '#475569' }}>Date: <strong>{new Date(invoiceData.orderDate).toLocaleDateString()}</strong></div>
                                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Status: <StatusBadge status={invoiceData.status} /></div>
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Item', 'Batch', 'Qty', 'Price', 'Total'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Item' ? 'left' : 'right', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceData.items.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{item.name} <span style={{ fontSize: 11, color: '#94a3b8' }}>({item.sku})</span></td>
                                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b', textAlign: 'right' }}>{item.batchId || '—'}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', color: '#475569' }}>{item.quantity}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', color: '#475569' }}>₹{item.unitPrice}</td>
                                        <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} style={{ padding: '12px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Grand Total</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: 16, fontWeight: 900, color: '#10b981' }}>₹{invoiceData.totalAmount?.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setIsInvoiceOpen(false)}>Close</button>
                            <button className="btn btn-primary" onClick={() => window.print()}>Print Invoice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
