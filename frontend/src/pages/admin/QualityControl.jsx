import { useState, useEffect } from 'react';
import API from '../../api';
import { Check as FiCheck, X as FiX, Clipboard as FiClipboard, AlertCircle as FiAlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function QualityControl() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [qcData, setQcData] = useState({
        inspector: 'Admin',
        tests: [
            { name: 'Visual Inspection', result: '', status: 'Pass' },
            { name: 'pH Level', result: '', status: 'Pass' },
            { name: 'Dissolution', result: '', status: 'Pass' },
            { name: 'Assay', result: '', status: 'Pass' }
        ],
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await API.get('/batches');
            const pending = res.data.filter(b => b.status === 'In Production' || b.status === 'Quality Check');
            setBatches(pending);
        } catch (err) {
            toast.error('Failed to load batches');
        }
    };

    const handleTestChange = (index, field, value) => {
        const newTests = [...qcData.tests];
        newTests[index][field] = value;
        setQcData({ ...qcData, tests: newTests });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/quality', {
                batchId: selectedBatch._id,
                ...qcData
            });
            toast.success('QC Report Submitted');
            setModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Submission failed');
        }
    };

    const openQC = (batch) => {
        setSelectedBatch(batch);
        setModalOpen(true);
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Quality Control</h1>
                <p>Inspect batches before release</p>
            </div>

            <div className="grid-list">
                {batches.map(b => (
                    <div key={b._id} className="card">
                        <div className="card-header">
                            <h3>{b.batchId}</h3>
                            <span className={`status-badge ${b.status === 'Quality Check' ? 'warning' : 'primary'}`}>{b.status}</span>
                        </div>
                        <div className="card-body">
                            <p><strong>Product:</strong> {b.productId?.name}</p>
                            <p><strong>Mfg Date:</strong> {new Date(b.mfgDate).toLocaleDateString()}</p>
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
                    <ModalContent className="max-w-[600px]">
                        <h2 className="text-xl font-bold mb-4">QC Inspection — {selectedBatch?.batchId}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Inspector Name</label>
                                <input value={qcData.inspector} onChange={e => setQcData({ ...qcData, inspector: e.target.value })} />
                            </div>

                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Result Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {qcData.tests.map((t, i) => (
                                        <tr key={i}>
                                            <td>{t.name}</td>
                                            <td><input className="input-sm" value={t.result} onChange={e => handleTestChange(i, 'result', e.target.value)} required /></td>
                                            <td>
                                                <Select value={t.status} onValueChange={(val) => handleTestChange(i, 'status', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Status" />
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
                                <textarea value={qcData.notes} onChange={e => setQcData({ ...qcData, notes: e.target.value })} />
                            </div>

                            <ModalFooter className="gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success">Submit Report</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
