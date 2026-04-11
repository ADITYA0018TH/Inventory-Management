import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { Package, Box, Layers, ShoppingCart, Search, ArrowRight } from 'lucide-react';

function ResultSection({ icon, title, items, onNavigate, renderItem }) {
    if (!items?.length) return null;
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ color: '#6366f1' }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#ede9fe', color: '#6366f1', padding: '2px 8px', borderRadius: 999 }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((item, i) => (
                    <div key={i} onClick={() => onNavigate(item)}
                        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafafe'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}>
                        {renderItem(item)}
                        <ArrowRight size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true);
            API.get(`/search?q=${encodeURIComponent(query)}`)
                .then(res => setResults(res.data))
                .catch(() => setResults(null))
                .finally(() => setLoading(false));
        }
    }, [query]);

    const total = results
        ? (results.products?.length || 0) + (results.materials?.length || 0) + (results.batches?.length || 0) + (results.orders?.length || 0)
        : 0;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Search Results</h1>
                    <p>
                        {loading ? 'Searching...' : results
                            ? `${total} result${total !== 1 ? 's' : ''} for "${query}"`
                            : `Enter a search term`}
                    </p>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
            )}

            {!loading && results && total === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <Search size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No results found for "{query}"</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Try searching for a batch ID, product name, or material</div>
                </div>
            )}

            {!loading && results && (
                <>
                    <ResultSection
                        icon={<Package size={16} />}
                        title="Products"
                        items={results.products}
                        onNavigate={() => navigate('/admin/products')}
                        renderItem={p => (
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                    {p.type} · SKU: {p.sku} · ₹{p.pricePerUnit}/unit
                                </div>
                            </div>
                        )}
                    />
                    <ResultSection
                        icon={<Box size={16} />}
                        title="Raw Materials"
                        items={results.materials}
                        onNavigate={() => navigate('/admin/inventory')}
                        renderItem={m => (
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                    Stock: {m.currentStock} {m.unit}
                                    {m.currentStock < m.minimumThreshold && (
                                        <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 600 }}>⚠ Low Stock</span>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                    <ResultSection
                        icon={<Layers size={16} />}
                        title="Batches"
                        items={results.batches}
                        onNavigate={() => navigate('/admin/batches')}
                        renderItem={b => (
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{b.batchId}</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                    {b.productId?.name} · {b.status} · Exp: {new Date(b.expDate).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    />
                    <ResultSection
                        icon={<ShoppingCart size={16} />}
                        title="Orders"
                        items={results.orders}
                        onNavigate={() => navigate('/admin/orders')}
                        renderItem={o => (
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                    {o.distributorId?.companyName || o.distributorId?.name}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                    {o.invoiceNumber || o._id.slice(-8)} · ₹{o.totalAmount?.toLocaleString()} · {o.status}
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </div>
    );
}
