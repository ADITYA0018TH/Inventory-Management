import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus as FiPlus, Check as FiCheck, X as FiX, Printer as FiPrinter, Download as FiDownload } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', productId: '', quantityProduced: '', mfgDate: '', expDate: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [b, p] = await Promise.all([API.get('/batches'), API.get('/products')]);
            setBatches(b.data); setProducts(p.data);
        } catch { toast.error('Failed to load data'); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/batches', form);
            toast.success('Batch created! Raw materials deducted automatically.');
            setShowForm(false);
            setForm({ batchId: '', productId: '', quantityProduced: '', mfgDate: '', expDate: '' });
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Batch creation failed'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/batches/${id}/status`, { status });
            toast.success(`Status updated to ${status}`);
            loadData();
        } catch { toast.error('Status update failed'); }
    };

    const exportCSV = () => {
        window.open('http://localhost:5001/api/export/batches', '_blank');
    };

    const statusColors = { 'In Production': 'badge-blue', 'Quality Check': 'badge-amber', 'Released': 'badge-green', 'Shipped': 'badge-purple' };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Batch Management</h1>
                    <p>Track production batches and expiry dates</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={exportCSV}><FiDownload /> Export CSV</button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <FiPlus /> Create Batch
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card form-card">
                    <h3>Create New Batch</h3>
                    <p className="form-hint">⚠️ Creating a batch will automatically deduct raw materials based on the product formula.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label>Batch ID</label><input type="text" name="batchId" value={form.batchId} onChange={handleChange} placeholder="AST-2026-001" required /></div>
                            <div className="form-group"><label>Product</label>
                                <Select value={form.productId} onValueChange={(val) => setForm(prev => ({ ...prev, productId: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p._id} value={p._id}>{p.name} ({p.type})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Quantity to Produce</label><input type="number" name="quantityProduced" value={form.quantityProduced} onChange={handleChange} placeholder="1000" required /></div>
                            <div className="form-group"><label>Mfg Date</label><DatePicker value={form.mfgDate} onChange={(date) => setForm({ ...form, mfgDate: date })} /></div>
                            <div className="form-group"><label>Expiry Date</label><DatePicker value={form.expDate} onChange={(date) => setForm({ ...form, expDate: date })} /></div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Batch</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr><th>Batch ID</th><th>Product</th><th>Quantity</th><th>Mfg Date</th><th>Exp Date</th><th>Status</th><th>QR</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {batches.map(b => (
                            <tr key={b._id}>
                                <td className="td-bold">{b.batchId}</td>
                                <td>{b.productId?.name || '—'}</td>
                                <td>{b.quantityProduced?.toLocaleString()}</td>
                                <td>{new Date(b.mfgDate).toLocaleDateString()}</td>
                                <td>{new Date(b.expDate).toLocaleDateString()}</td>
                                <td><span className={`badge ${statusColors[b.status]}`}>{b.status}</span></td>
                                <td>
                                    {b.qrCodeData && (
                                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedBatch(b)}>View QR</button>
                                    )}
                                </td>
                                <td>
                                    <Select value={b.status} onValueChange={(val) => updateStatus(b._id, val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="In Production">In Production</SelectItem>
                                            <SelectItem value="Quality Check">Quality Check</SelectItem>
                                            <SelectItem value="Released">Released</SelectItem>
                                            <SelectItem value="Shipped">Shipped</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                            </tr>
                        ))}
                        {batches.length === 0 && <tr><td colSpan="8" className="empty-table">No batches created yet</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* QR Code Modal */}
            {/* QR Code Modal */}
            <Modal open={!!selectedBatch} setOpen={(open) => !open && setSelectedBatch(null)}>
                <ModalBody>
                    <ModalContent className="items-center text-center max-w-[400px]">
                        {selectedBatch && (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-white">QR Code — {selectedBatch.batchId}</h3>
                                <div className="qr-container mx-auto mb-6 bg-white p-4 rounded-xl inline-block shadow-lg">
                                    <img src={selectedBatch.qrCodeData} alt="QR Code" className="w-48 h-48 max-w-none" />
                                </div>
                                <div className="qr-details text-sm text-left grid grid-cols-2 gap-4 w-full mb-6 bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                                    <p><span className="text-neutral-400 block mb-1">Product</span><span className="text-white font-medium">{selectedBatch.productId?.name}</span></p>
                                    <p><span className="text-neutral-400 block mb-1">Quantity</span><span className="text-white font-medium">{selectedBatch.quantityProduced?.toLocaleString()}</span></p>
                                    <p><span className="text-neutral-400 block mb-1">Mfg Date</span><span className="text-white font-medium">{new Date(selectedBatch.mfgDate).toLocaleDateString()}</span></p>
                                    <p><span className="text-neutral-400 block mb-1">Exp Date</span><span className="text-white font-medium">{new Date(selectedBatch.expDate).toLocaleDateString()}</span></p>
                                </div>
                                <ModalFooter className="bg-transparent flex justify-center w-full mt-2">
                                    <button className="btn btn-ghost w-full" onClick={() => setSelectedBatch(null)}>Close</button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
