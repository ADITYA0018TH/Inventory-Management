import { useState, useEffect } from 'react';
import API from '../../api';
import { Check as FiCheck, X as FiX, AlertTriangle as FiAlertTriangle, Search as FiSearch } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function Returns() {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);
    const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
    const [recallData, setRecallData] = useState({ batchId: '', reason: '', productId: '', quantity: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [retRes, prodRes] = await Promise.all([API.get('/returns'), API.get('/products')]);
            setReturns(retRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await API.put(`/returns/${id}/status`, { status });
            toast.success(`Return marked as ${status}`);
            loadData();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleRecallSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/returns', { ...recallData, type: 'Recall' });
            toast.success('Recall initiated');
            setIsRecallModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Failed to initiate recall');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Returns & Recalls</h1>
                    <p>Manage distributor returns and batch recalls</p>
                </div>
                <button className="btn btn-danger" onClick={() => setIsRecallModalOpen(true)}><FiAlertTriangle /> Initiate Batch Recall</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>ID / Batch</th>
                            <th>Distributor</th>
                            <th>Product</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.map(r => (
                            <tr key={r._id}>
                                <td><span className={`badge ${r.type === 'Recall' ? 'badge-danger' : 'badge-amber'}`}>{r.type}</span></td>
                                <td>{r.batchId || r._id.slice(-6)}</td>
                                <td>{r.distributorId?.name || 'N/A'}</td>
                                <td>{r.productId?.name}</td>
                                <td>{r.reason}</td>
                                <td>
                                    <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                                </td>
                                <td>
                                    {r.status === 'Pending' && (
                                        <div className="action-buttons">
                                            <button className="btn-icon success" onClick={() => handleStatusUpdate(r._id, 'Approved')} title="Approve"><FiCheck /></button>
                                            <button className="btn-icon danger" onClick={() => handleStatusUpdate(r._id, 'Rejected')} title="Reject"><FiX /></button>
                                        </div>
                                    )}
                                    {r.status === 'Approved' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(r._id, 'Completed')}>Mark Completed</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={isRecallModalOpen} setOpen={setIsRecallModalOpen}>
                <ModalBody>
                    <ModalContent className="max-w-[500px]">
                        <h2 className="text-xl font-bold mb-4 text-white">Initiate Batch Recall</h2>
                        <form onSubmit={handleRecallSubmit}>
                            <div className="form-group">
                                <label>Batch ID</label>
                                <input value={recallData.batchId} onChange={e => setRecallData({ ...recallData, batchId: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Product</label>
                                <Select value={recallData.productId} onValueChange={(val) => setRecallData({ ...recallData, productId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>Reason for Recall</label>
                                <textarea value={recallData.reason} onChange={e => setRecallData({ ...recallData, reason: e.target.value })} required />
                            </div>
                            <ModalFooter className="gap-2 mt-4 bg-transparent border-t border-white/10">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsRecallModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-danger">Initiate Recall</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
