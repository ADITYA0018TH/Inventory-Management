import { useState, useEffect } from 'react';
import API from '../../api';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Request Return</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product</label>
                                <select value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} required>
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
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
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
