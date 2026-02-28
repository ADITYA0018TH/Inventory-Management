import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { MapPin as FiMapPin, Box as FiBox, ArrowRight as FiArrowRight } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Multi-Warehouse Management</h1>
                    <p>Manage warehouses and inter-warehouse transfers</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowTransfer(!showTransfer)}>
                        <FiArrowRight /> Transfer
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        + Add Warehouse
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card form-card section-gap">
                    <h3>Add Warehouse</h3>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label>Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Main Warehouse" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. Mumbai, Maharashtra" />
                        </div>
                        <div className="form-group">
                            <label>Capacity (units)</label>
                            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Warehouse</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {showTransfer && (
                <div className="card form-card section-gap">
                    <h3>Inter-Warehouse Transfer</h3>
                    <form onSubmit={handleTransfer}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>From Warehouse</label>
                                <Select value={transferForm.fromWarehouseId} onValueChange={(val) => setTransferForm({ ...transferForm, fromWarehouseId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>To Warehouse</label>
                                <Select value={transferForm.toWarehouseId} onValueChange={(val) => setTransferForm({ ...transferForm, toWarehouseId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select destination..." /></SelectTrigger>
                                    <SelectContent>
                                        {warehouses.filter(w => w._id !== transferForm.fromWarehouseId).map(w => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Material</label>
                                <Select value={transferForm.materialId} onValueChange={(val) => setTransferForm({ ...transferForm, materialId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select material..." /></SelectTrigger>
                                    <SelectContent>
                                        {materials.map(m => <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Execute Transfer</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowTransfer(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid-auto-fill-280 section-gap">
                {warehouses.map(wh => {
                    const utilization = wh.capacity > 0 ? ((wh.totalQuantity / wh.capacity) * 100).toFixed(0) : 0;
                    const barColor = utilization > 80 ? 'var(--danger)' : utilization > 50 ? 'var(--warning)' : 'var(--success)';
                    return (
                        <div key={wh._id} className={`card warehouse-card card-bordered-left ${utilization > 80 ? 'card-border-red' : utilization > 50 ? 'card-border-amber' : 'card-border-green'}`} onClick={() => loadStock(wh._id)}>
                            <div className="card-header">
                                <div>
                                    <h3 className="mb-0">{wh.name}</h3>
                                    <p className="text-sm text-secondary-color flex-row mt-2"><FiMapPin size={12} /> {wh.location}</p>
                                </div>
                                <span className={`status-badge ${wh.isActive ? 'active' : 'inactive'}`}>
                                    {wh.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-3">
                                <div className="flex-between text-xs mb-2">
                                    <span className="flex-row gap-2"><FiBox size={12} />{wh.stockItems} items</span>
                                    <span>{utilization}% utilized</span>
                                </div>
                                <div className="warehouse-progress">
                                    <div className="warehouse-progress-bar" style={{ width: `${Math.min(utilization, 100)}%`, background: barColor }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedWarehouse && (
                <div className="card">
                    <h3>Stock in {warehouses.find(w => w._id === selectedWarehouse)?.name}</h3>
                    <table className="data-table">
                        <thead><tr><th>Material</th><th>Quantity</th><th>Unit</th><th>Last Updated</th></tr></thead>
                        <tbody>
                            {warehouseStock.length === 0 ? (
                                <tr><td colSpan={4} className="empty-table">No stock in this warehouse</td></tr>
                            ) : warehouseStock.map(s => (
                                <tr key={s._id}>
                                    <td className="td-bold">{s.materialId?.name}</td>
                                    <td>{s.quantity}</td>
                                    <td>{s.materialId?.unit}</td>
                                    <td className="text-muted">{new Date(s.lastUpdated).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
