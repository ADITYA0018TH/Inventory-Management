import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus, Trash2, Edit2, Phone, Mail, MapPin, Star, User, TrendingUp, X, Search, Users, Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

function StarRating({ value, max = 5 }) {
    return (
        <div style={{ display: 'flex', gap: 2 }}>
            {[...Array(max)].map((_, i) => (
                <Star key={i} size={13}
                    fill={i < value ? '#f59e0b' : 'none'}
                    color={i < value ? '#f59e0b' : '#d1d5db'}
                />
            ))}
        </div>
    );
}

function Avatar({ name, size = 44 }) {
    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color + '18', color, fontWeight: 700, fontSize: size * 0.33, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${color}30`, flexShrink: 0 }}>
            {initials}
        </div>
    );
}

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 });
    const [editingId, setEditingId] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [perfSupplierId, setPerfSupplierId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [supRes, matRes] = await Promise.all([API.get('/suppliers'), API.get('/raw-materials')]);
            setSuppliers(supRes.data); setMaterials(matRes.data);
        } catch { toast.error('Failed to load data'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) { await API.put(`/suppliers/${editingId}`, formData); toast.success('Supplier updated'); }
            else { await API.post('/suppliers', formData); toast.success('Supplier added'); }
            setIsModalOpen(false);
            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 });
            setEditingId(null); loadData();
        } catch { toast.error('Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this supplier?')) return;
        try { await API.delete(`/suppliers/${id}`); toast.success('Deleted'); loadData(); }
        catch { toast.error('Failed to delete'); }
    };

    const openEdit = (s) => { setFormData({ ...s, materials: s.materials.map(m => m._id) }); setEditingId(s._id); setIsModalOpen(true); };
    const openCreate = () => { setEditingId(null); setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 }); setIsModalOpen(true); };

    const loadPerformance = async (supplierId) => {
        if (perfSupplierId === supplierId) { setPerformance(null); setPerfSupplierId(null); return; }
        try {
            const res = await API.get(`/suppliers/${supplierId}/performance`);
            setPerformance(res.data); setPerfSupplierId(supplierId);
        } catch { toast.error('Failed to load performance'); }
    };

    const filtered = suppliers.filter(s => {
        const q = search.toLowerCase();
        return !q || [s.name, s.contactPerson, s.email, s.phone].filter(Boolean).some(v => v.toLowerCase().includes(q));
    });

    const avgRating = suppliers.length ? (suppliers.reduce((t, s) => t + (s.effectiveRating || s.rating || 0), 0) / suppliers.length).toFixed(1) : '—';
    const totalLinks = suppliers.reduce((t, s) => t + (s.materials?.length || 0), 0);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Supplier Management</h1>
                    <p>Manage supplier profiles, contacts, and material partnerships</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Supplier</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Total Suppliers', value: suppliers.length, icon: <Users size={20} />, color: '#6366f1' },
                    { label: 'Avg Rating', value: avgRating, icon: <Star size={20} />, color: '#f59e0b' },
                    { label: 'Material Links', value: totalLinks, icon: <Package size={20} />, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Search size={15} color="#94a3b8" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, contact, email, phone..."
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#0f172a', background: 'transparent' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} of {suppliers.length}</span>
            </div>

            {/* Supplier cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filtered.map(s => {
                    const isExpanded = expandedId === s._id;
                    const isPerfOpen = perfSupplierId === s._id;
                    return (
                        <div key={s._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                            {/* Card header */}
                            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <Avatar name={s.name} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{s.name}</div>
                                        <StarRating value={s.effectiveRating || s.rating || 0} />
                                        {s.autoRating != null && (
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                                                Auto: {s.autoRating}/5 · Manual: {s.rating}/5
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: s.status === 'Active' ? '#d1fae5' : '#f1f5f9', color: s.status === 'Active' ? '#059669' : '#94a3b8' }}>
                                        {s.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    [User, s.contactPerson, 'No contact person'],
                                    [Mail, s.email, 'No email'],
                                    [Phone, s.phone, 'No phone'],
                                    [MapPin, s.address, 'No address'],
                                ].map(([Icon, value, fallback], i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                        <Icon size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                                        <span style={{ color: value ? '#475569' : '#c7d2fe', fontStyle: value ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {value || fallback}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Materials */}
                            <div style={{ padding: '0 20px 14px' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Supplied Materials</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                    {s.materials?.length
                                        ? s.materials.map(m => (
                                            <span key={m._id} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#ede9fe', color: '#6366f1' }}>{m.name}</span>
                                        ))
                                        : <span style={{ fontSize: 11, color: '#c7d2fe', fontStyle: 'italic' }}>No linked materials</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
                                <button onClick={() => loadPerformance(s._id)} style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${isPerfOpen ? '#6366f1' : '#e2e8f0'}`, background: isPerfOpen ? '#ede9fe' : '#fff', color: isPerfOpen ? '#6366f1' : '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                    <TrendingUp size={12} /> Performance
                                </button>
                                <button onClick={() => openEdit(s)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDelete(s._id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            {/* Performance panel */}
                            {isPerfOpen && performance && (
                                <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Purchase Order Performance</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                                        {[
                                            ['Total POs', performance.total, '#0f172a'],
                                            ['Received', performance.received, '#10b981'],
                                            ['Delivery Rate', `${performance.deliveryRate}%`, '#6366f1'],
                                        ].map(([label, val, color]) => (
                                            <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
                                                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {performance.recentOrders?.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            {performance.recentOrders.slice(0, 3).map(po => (
                                                <div key={po._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '5px 8px', background: '#fff', borderRadius: 7, border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{po.poNumber}</span>
                                                    <span style={{ color: po.status === 'Received' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{po.status}</span>
                                                    <span style={{ color: '#64748b' }}>₹{po.totalAmount?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <div style={{ fontSize: 14 }}>{search ? 'No suppliers match your search' : 'No suppliers added yet'}</div>
                </div>
            )}

            {/* Modal */}
            <Modal open={isModalOpen} setOpen={setIsModalOpen}>
                <ModalBody>
                    <ModalContent style={{ maxWidth: 520 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                        </div>
                        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Supplier contacts and material sourcing details</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Company Name *</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                            <div className="form-group"><label>Contact Person</label><input value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                <div className="form-group"><label>Phone</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Address</label><textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>GST Number</label><input value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} /></div>
                                <div className="form-group"><label>Rating (1–5)</label><input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} /></div>
                            </div>
                            <div className="form-group">
                                <label>Supplied Materials</label>
                                <select multiple value={formData.materials} onChange={e => setFormData({ ...formData, materials: [...e.target.selectedOptions].map(o => o.value) })}
                                    style={{ width: '100%', minHeight: 100, padding: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a' }}>
                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                </select>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</div>
                            </div>
                            <ModalFooter style={{ background: 'transparent', borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Supplier</button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
