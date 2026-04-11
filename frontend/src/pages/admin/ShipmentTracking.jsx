import { useState, useEffect } from 'react';
import API from '../../api';
import { Truck, MapPin, CheckCircle, Clock, Package, X, Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

const TRACKING_STEPS = ['Order Placed', 'Approved', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'];

const STATUS_ICON = {
    'Order Placed':      <Package size={14} />,
    'Approved':          <CheckCircle size={14} />,
    'Dispatched':        <Truck size={14} />,
    'In Transit':        <Truck size={14} />,
    'Out for Delivery':  <MapPin size={14} />,
    'Delivered':         <CheckCircle size={14} />,
    'Delayed':           <AlertTriangle size={14} />,
};

function ShipmentTimeline({ tracking, status }) {
    // Map order status to step index
    const statusToStep = { 'Pending': 0, 'Approved': 1, 'Shipped': 3, 'Delivered': 5 };
    const currentStep = statusToStep[status] ?? 0;

    return (
        <div style={{ margin: '16px 0' }}>
            {/* Progress steps */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                {TRACKING_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < TRACKING_STEPS.length - 1 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                    background: done ? (active ? '#6366f1' : '#10b981') : '#f1f5f9',
                                    border: `2px solid ${done ? (active ? '#6366f1' : '#10b981') : '#e2e8f0'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: done ? '#fff' : '#94a3b8',
                                    boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {done ? (active ? STATUS_ICON[step] || <Clock size={12} /> : <CheckCircle size={12} />) : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db' }} />}
                                </div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: done ? (active ? '#6366f1' : '#10b981') : '#94a3b8', textAlign: 'center', maxWidth: 60, lineHeight: 1.2 }}>
                                    {step}
                                </div>
                            </div>
                            {i < TRACKING_STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: i < currentStep ? '#10b981' : '#e2e8f0', margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tracking event log */}
            {tracking?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[...tracking].reverse().map((t, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < tracking.length - 1 ? 16 : 0 }}>
                            {i < tracking.length - 1 && (
                                <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: '#f1f5f9' }} />
                            )}
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#ede9fe' : '#f8fafc', border: `1px solid ${i === 0 ? '#c7d2fe' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: i === 0 ? '#6366f1' : '#94a3b8', zIndex: 1 }}>
                                {STATUS_ICON[t.status] || <Clock size={10} />}
                            </div>
                            <div style={{ flex: 1, paddingBottom: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.status}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(t.timestamp).toLocaleString()}</div>
                                </div>
                                {t.location && <div style={{ fontSize: 12, color: '#6366f1', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{t.location}</div>}
                                {t.note && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.note}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ShipmentTracking() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [updateData, setUpdateData] = useState({ status: 'In Transit', location: '', note: '' });

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            const res = await API.get('/orders');
            setOrders(res.data.filter(o => ['Approved', 'Shipped', 'Delivered'].includes(o.status)));
        } catch { toast.error('Failed to load orders'); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/orders/${selectedOrder._id}/tracking`, updateData);
            if (updateData.status === 'Delivered') {
                await API.put(`/orders/${selectedOrder._id}/status`, { status: 'Delivered' });
            }
            toast.success('Tracking updated');
            setModalOpen(false);
            loadOrders();
        } catch { toast.error('Update failed'); }
    };

    const inTransit = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Shipment Tracking</h1>
                    <p>Monitor downstream logistics and delivery status</p>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Total Shipments', value: orders.length, color: '#6366f1', bg: '#ede9fe', icon: <Package size={20} /> },
                    { label: 'In Transit', value: inTransit, color: '#f59e0b', bg: '#fffbeb', icon: <Truck size={20} /> },
                    { label: 'Delivered', value: delivered, color: '#10b981', bg: '#d1fae5', icon: <CheckCircle size={20} /> },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Shipment cards */}
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <Truck size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <div style={{ fontSize: 14 }}>No active shipments</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map(o => (
                        <div key={o._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                                        {o.invoiceNumber || o._id.slice(-8).toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                        To: <strong>{o.distributorId?.companyName || o.distributorId?.name}</strong>
                                        {' · '}{o.items.length} item{o.items.length !== 1 ? 's' : ''}
                                        {' · '}₹{o.totalAmount?.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                                        background: o.status === 'Delivered' ? '#d1fae5' : o.status === 'Shipped' ? '#fffbeb' : '#eff6ff',
                                        color: o.status === 'Delivered' ? '#059669' : o.status === 'Shipped' ? '#d97706' : '#3b82f6',
                                    }}>{o.status}</span>
                                    {o.status !== 'Delivered' && (
                                        <button onClick={() => { setSelectedOrder(o); setModalOpen(true); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                            <Plus size={13} /> Update
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <ShipmentTimeline tracking={o.tracking} status={o.status} />
                        </div>
                    ))}
                </div>
            )}

            {/* Update modal */}
            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBody>
                    <ModalContent style={{ maxWidth: 420 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Update Tracking</h3>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{selectedOrder?.invoiceNumber}</p>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Status</label>
                                <Select value={updateData.status} onValueChange={val => setUpdateData({ ...updateData, status: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                                        <SelectItem value="In Transit">In Transit</SelectItem>
                                        <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Delayed">Delayed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={updateData.location} onChange={e => setUpdateData({ ...updateData, location: e.target.value })} placeholder="e.g. Mumbai Hub, Delhi Warehouse" required />
                            </div>
                            <div className="form-group">
                                <label>Note (optional)</label>
                                <textarea value={updateData.note} onChange={e => setUpdateData({ ...updateData, note: e.target.value })} rows={2} placeholder="Additional details..." />
                            </div>
                            <ModalFooter style={{ background: 'transparent', border: 'none', paddingTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Tracking</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
