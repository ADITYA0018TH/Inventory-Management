import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus as FiPlus, AlertCircle as FiAlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function DistributorReturns() {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ batchId: '', reason: '', productId: '', quantity: 0 });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/returns', formData);
            toast.success('Return requested');
            setModalOpen(false);
            setFormData({ batchId: '', reason: '', productId: '', quantity: 0 });
            loadData();
        } catch (err) {
            toast.error('Request failed');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Returns</h1>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Request Return</button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Response Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.map(r => (
                            <tr key={r._id}>
                                <td>{r._id.slice(-6)}</td>
                                <td>{r.productId?.name}</td>
                                <td>{r.quantity}</td>
                                <td>{r.reason}</td>
                                <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                                <td>{r.notes || '-'}</td>
                            </tr>
                        ))}
                        {returns.length === 0 && <tr><td colspan="6" className="text-center text-muted">No returns found</td></tr>}
                    </tbody>
                </table>
            </div>

            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBody>
                    <ModalContent className="max-w-[500px]">
                        <h2 className="text-xl font-bold mb-4 text-white">Request Return</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product</label>
                                <Select value={formData.productId} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
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
                                <label>Batch ID (Optional)</label>
                                <input value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required />
                            </div>
                            <ModalFooter className="gap-2 mt-4 bg-transparent border-t border-white/10">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Request</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
