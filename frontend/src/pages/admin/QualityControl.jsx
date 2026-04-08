import { useState, useEffect } from 'react';
import API from '../../api';
import { Clipboard as FiClipboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function QualityControl() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [qcData, setQcData] = useState({ inspector: '', tests: [], notes: '' });
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await API.get('/batches');
            setBatches(res.data.filter(b => b.status === 'In Production' || b.status === 'Quality Check'));
        } catch { toast.error('Failed to load batches'); }
    };

    const openQC = async (batch) => {
        setSelectedBatch(batch);
        setLoadingTemplates(true);
        setModalOpen(true);
        try {
            // Load product-specific test templates from backend
            const res = await API.get(`/quality/templates/${batch._id}`);
            const tests = res.data.tests.map(t => ({ name: t.name, result: '', status: 'Pass', description: t.description || '' }));
            setQcData({ inspector: '', tests, notes: '' });
        } catch {
            // Fallback to defaults
            setQcData({
                inspector: '',
                tests: [
                    { name: 'Visual Inspection', result: '', status: 'Pass' },
                    { name: 'pH Level', result: '', status: 'Pass' },
                    { name: 'Dissolution', result: '', status: 'Pass' },
                    { name: 'Assay', result: '', status: 'Pass' }
                ],
                notes: ''
            });
        }
        setLoadingTemplates(false);
    };

    const handleTestChange = (index, field, value) => {
        const newTests = [...qcData.tests];
        newTests[index][field] = value;
        setQcData({ ...qcData, tests: newTests });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qcData.inspector.trim()) return toast.error('Inspector name is required');
        try {
            await API.post('/quality', { batchId: selectedBatch._id, ...qcData });
            const allPass = qcData.tests.every(t => t.status === 'Pass');
            toast.success(allPass ? 'QC Passed — Batch Released' : 'QC Report Submitted (Failed)');
            setModalOpen(false);
            loadData();
        } catch { toast.error('Submission failed'); }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Quality Control</h1>
                <p>Inspect batches before release — tests loaded from product configuration</p>
            </div>

            <div className="grid-list">
                {batches.map(b => (
                    <div key={b._id} className="card">
                        <div className="card-header">
                            <h3>{b.batchId}</h3>
                            <span className={`status-badge ${b.status === 'Quality Check' ? 'warning' : 'primary'}`}>{b.status}</span>
                        </div>
                        <div className="card-body">
                            <p><strong>Product:</strong> {b.productId?.name} ({b.productId?.type})</p>
                            <p><strong>Mfg Date:</strong> {new Date(b.mfgDate).toLocaleDateString()}</p>
                            <p><strong>Qty:</strong> {b.quantityProduced} units</p>
                            <button className="btn btn-primary btn-full mt-4" onClick={() => openQC(b)}>
                                <FiClipboard /> Perform QC
                            </button>
                        </div>
                    </div>
                ))}
                {batches.length === 0 && <div className="empty-state">No batches pending QC</div>}
            </div>

            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBody>
                    <ModalContent className="max-w-[640px]">
                        <h2 className="text-xl font-bold mb-1">QC Inspection — {selectedBatch?.batchId}</h2>
                        <p className="text-sm text-secondary-color mb-4">
                            Product: {selectedBatch?.productId?.name} · Tests loaded from product configuration
                        </p>
                        {loadingTemplates ? (
                            <div className="text-center py-8"><div className="spinner"></div></div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Inspector Name *</label>
                                    <input
                                        value={qcData.inspector}
                                        onChange={e => setQcData({ ...qcData, inspector: e.target.value })}
                                        placeholder="Enter inspector name"
                                        required
                                    />
                                </div>

                                <table className="data-table">
                                    <thead>
                                        <tr><th>Test</th><th>Description</th><th>Result Value</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {qcData.tests.map((t, i) => (
                                            <tr key={i}>
                                                <td className="td-bold">{t.name}</td>
                                                <td className="text-xs text-muted">{t.description || '—'}</td>
                                                <td>
                                                    <input
                                                        className="input-sm"
                                                        value={t.result}
                                                        onChange={e => handleTestChange(i, 'result', e.target.value)}
                                                        placeholder="e.g. 7.2"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Select value={t.status} onValueChange={(val) => handleTestChange(i, 'status', val)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Pass">Pass</SelectItem>
                                                            <SelectItem value="Fail">Fail</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="form-group mt-4">
                                    <label>Notes</label>
                                    <textarea
                                        value={qcData.notes}
                                        onChange={e => setQcData({ ...qcData, notes: e.target.value })}
                                        placeholder="Additional observations..."
                                        rows={3}
                                    />
                                </div>

                                <ModalFooter className="gap-2 mt-4">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success">Submit QC Report</button>
                                </ModalFooter>
                            </form>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
