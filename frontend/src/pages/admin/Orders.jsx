import { useState, useEffect } from 'react';
import API from '../../api';
import { Check as FiCheck, Truck as FiTruck, X as FiX, Box as FiBox, FileText as FiFileText, Download as FiDownload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [batches, setBatches] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ordersRes, batchesRes] = await Promise.all([API.get('/orders'), API.get('/batches')]);
            setOrders(ordersRes.data);
            setBatches(batchesRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}/status`, { status });
            toast.success(`Order ${status}`);
            loadData();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleAssignBatch = async () => {
        try {
            await API.put(`/orders/${selectedOrder._id}/assign-batch`, {
                itemIndex: selectedItemIndex,
                batchId: selectedBatchId
            });
            toast.success('Batch assigned');
            setIsAssignModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Assignment failed');
        }
    };

    const openAssign = (order, index) => {
        setSelectedOrder(order);
        setSelectedItemIndex(index);
        setIsAssignModalOpen(true);
    };

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

    const downloadPDF = (orderId) => {
        const token = localStorage.getItem('token');
        window.open(`http://localhost:5001/api/invoice/${orderId}/pdf?token=${token}`, '_blank');
    };

    const exportCSV = () => {
        window.open('http://localhost:5001/api/export/orders', '_blank');
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Order Management</h1>
                <button className="btn btn-secondary" onClick={exportCSV}><FiDownload /> Export CSV</button>
            </div>

            <div className="grid-list">
                {orders.map(o => (
                    <div key={o._id} className="card order-card">
                        <div className="card-header">
                            <div>
                                <h3>{o.invoiceNumber || o._id.slice(-6)}</h3>
                                <span className="text-sm text-muted">{new Date(o.orderDate).toLocaleString()}</span>
                            </div>
                            <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                        </div>
                        <div className="card-body">
                            <p><strong>Distributor:</strong> {o.distributorId?.companyName || o.distributorId?.name}</p>
                            <div className="order-items">
                                {o.items.map((item, i) => (
                                    <div key={i} className="order-item">
                                        <span>{item.productId?.name} x {item.quantity}</span>
                                        {item.batchId ? (
                                            <span className="badge badge-blue">{item.batchId}</span>
                                        ) : (
                                            o.status === 'Pending' && (
                                                <button className="btn-xs btn-outline" onClick={() => openAssign(o, i)}>Assign Batch</button>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="total-amount">Total: ₹{o.totalAmount?.toLocaleString()}</div>
                        </div>
                        <div className="card-footer">
                            <button className="btn-icon" onClick={() => viewInvoice(o)} title="View Invoice"><FiFileText /></button>
                            <button className="btn-icon" onClick={() => downloadPDF(o._id)} title="Download PDF"><FiDownload /></button>
                            {o.status === 'Pending' && (
                                <>
                                    <button className="btn-icon success" onClick={() => updateStatus(o._id, 'Approved')}><FiCheck /></button>
                                    <button className="btn-icon danger" onClick={() => updateStatus(o._id, 'Cancelled')}><FiX /></button>
                                </>
                            )}
                            {o.status === 'Approved' && (
                                <button className="btn btn-primary" onClick={() => updateStatus(o._id, 'Shipped')}><FiTruck /> Ship Order</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={isAssignModalOpen} setOpen={setIsAssignModalOpen}>
                <ModalBody>
                    <ModalContent className="max-w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Assign Batch</h2>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Batch..." />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.filter(b => b.status === 'Released').map(b => (
                                    <SelectItem key={b.batchId} value={b.batchId}>{b.batchId} ({b.quantityProduced} units)</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ModalFooter className="gap-2 mt-4">
                            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssignBatch}>Assign</button>
                        </ModalFooter>
                    </ModalContent>
                </ModalBody>
            </Modal>

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
