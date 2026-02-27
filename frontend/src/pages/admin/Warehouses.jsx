import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiMapPin, FiBox, FiArrowRight } from 'react-icons/fi';

export default function Warehouses() {
    const [warehouses, setWarehouses] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [form, setForm] = useState({ name: '', location: '', capacity: 10000 });
    const [transferForm, setTransferForm] = useState({ fromWarehouseId: '', toWarehouseId: '', materialId: '', quantity: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [whRes, matRes] = await Promise.all([
                API.get('/warehouses'),
                API.get('/raw-materials')
            ]);
            setWarehouses(whRes.data);
            setMaterials(matRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/warehouses', form);
            toast.success('Warehouse created');
            setShowForm(false);
            setForm({ name: '', location: '', capacity: 10000 });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create');
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await API.post('/warehouses/transfer', { ...transferForm, quantity: parseInt(transferForm.quantity) });
            toast.success('Transfer completed!');
            setShowTransfer(false);
            setTransferForm({ fromWarehouseId: '', toWarehouseId: '', materialId: '', quantity: '' });
            loadData();
            if (selectedWarehouse) loadStock(selectedWarehouse);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transfer failed');
        }
    };

    const loadStock = async (whId) => {
        setSelectedWarehouse(whId);
        try {
            const res = await API.get(`/warehouses/${whId}/stock`);
            setWarehouseStock(res.data);
        } catch { setWarehouseStock([]); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🏭 Multi-Warehouse Management</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => setShowTransfer(!showTransfer)}>
                        <FiArrowRight /> Transfer
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        + Add Warehouse
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Add Warehouse</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
                        <div>
                            <label className="form-label">Name</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Main Warehouse" />
                        </div>
                        <div>
                            <label className="form-label">Location</label>
                            <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Mumbai, Maharashtra" />
                        </div>
                        <div>
                            <label className="form-label">Capacity (units)</label>
                            <input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary">Create Warehouse</button>
                    </form>
                </div>
            )}

            {showTransfer && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Inter-Warehouse Transfer</h3>
                    <form onSubmit={handleTransfer} style={{ display: 'grid', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="form-label">From Warehouse</label>
                                <select className="form-input" value={transferForm.fromWarehouseId} onChange={e => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })} required>
                                    <option value="">Select source...</option>
                                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">To Warehouse</label>
                                <select className="form-input" value={transferForm.toWarehouseId} onChange={e => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })} required>
                                    <option value="">Select destination...</option>
                                    {warehouses.filter(w => w._id !== transferForm.fromWarehouseId).map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="form-label">Material</label>
                                <select className="form-input" value={transferForm.materialId} onChange={e => setTransferForm({ ...transferForm, materialId: e.target.value })} required>
                                    <option value="">Select material...</option>
                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Quantity</label>
                                <input type="number" className="form-input" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Execute Transfer</button>
                    </form>
                </div>
            )}

            {/* Warehouse Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                {warehouses.map(wh => {
                    const utilization = wh.capacity > 0 ? ((wh.totalQuantity / wh.capacity) * 100).toFixed(0) : 0;
                    return (
                        <div key={wh._id} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${utilization > 80 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#10b981'}` }} onClick={() => loadStock(wh._id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px' }}>{wh.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiMapPin size={12} /> {wh.location}
                                    </p>
                                </div>
                                <span className={`status-badge ${wh.isActive ? 'status-Delivered' : 'status-Cancelled'}`}>
                                    {wh.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span><FiBox style={{ marginRight: 4 }} />{wh.stockItems} items</span>
                                    <span>{utilization}% utilized</span>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(utilization, 100)}%`, height: '100%', background: utilization > 80 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#10b981', borderRadius: 4 }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stock Detail */}
            {selectedWarehouse && (
                <div className="card">
                    <h3>📦 Stock in {warehouses.find(w => w._id === selectedWarehouse)?.name}</h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Material</th><th>Quantity</th><th>Unit</th><th>Last Updated</th></tr></thead>
                            <tbody>
                                {warehouseStock.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30 }}>No stock in this warehouse</td></tr>
                                ) : warehouseStock.map(s => (
                                    <tr key={s._id}>
                                        <td><strong>{s.materialId?.name}</strong></td>
                                        <td>{s.quantity}</td>
                                        <td>{s.materialId?.unit}</td>
                                        <td>{new Date(s.lastUpdated).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
