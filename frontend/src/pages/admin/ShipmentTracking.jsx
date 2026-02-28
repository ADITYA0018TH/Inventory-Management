import { useState, useEffect } from 'react';
import API from '../../api';
import { Truck as FiTruck, MapPin as FiMapPin, CheckCircle as FiCheckCircle, Clock as FiClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function ShipmentTracking() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [updateData, setUpdateData] = useState({ status: 'Shipped', location: '', note: '' });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await API.get('/orders');
            const shipped = res.data.filter(o => o.status === 'Shipped' || o.status === 'Delivered');
            setOrders(shipped);
        } catch (err) {
            toast.error('Failed to load orders');
        }
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
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const openUpdate = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Shipment Tracking</h1>
                <p>Monitor downstream logistics</p>
            </div>

            <div className="grid-list">
                {orders.map(o => (
                    <div key={o._id} className="card">
                        <div className="card-header">
                            <h3>{o.invoiceNumber || o._id.slice(-6)}</h3>
                            <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                        </div>
                        <div className="card-body">
                            <p><strong>To:</strong> {o.distributorId?.companyName || o.distributorId?.name}</p>
                            <p><strong>Items:</strong> {o.items.length} skus</p>

                            <div className="tracking-timeline">
                                {o.tracking?.map((t, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className={`timeline-dot ${i === o.tracking.length - 1 ? 'completed' : 'pending'}`}></div>
                                        <div className="timeline-content">
                                            <div className="timeline-date">{new Date(t.timestamp).toLocaleString()}</div>
                                            <div className="timeline-status">{t.status}</div>
                                            <div className="text-sm">{t.location} — {t.note}</div>
                                        </div>
                                    </div>
                                ))}
                                {o.tracking?.length === 0 && <div className="text-muted">No tracking updates yet</div>}
                            </div>

                            {o.status !== 'Delivered' && (
                                <button className="btn btn-primary btn-full mt-4" onClick={() => openUpdate(o)}>
                                    <FiTruck /> Update Status
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBody>
                    <ModalContent className="max-w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Update Tracking — {selectedOrder?.invoiceNumber}</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Current Status</label>
                                <Select value={updateData.status} onValueChange={(val) => setUpdateData({ ...updateData, status: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Transit">In Transit</SelectItem>
                                        <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Delayed">Delayed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={updateData.location} onChange={e => setUpdateData({ ...updateData, location: e.target.value })} placeholder="City, Hub, etc." required />
                            </div>
                            <div className="form-group">
                                <label>Note</label>
                                <textarea value={updateData.note} onChange={e => setUpdateData({ ...updateData, note: e.target.value })} />
                            </div>
                            <ModalFooter className="gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
