import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Box, Layers, ShoppingCart, ArrowRight } from 'lucide-react';
import API from '../../api';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const navigate = useNavigate();
    const timerRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (value) => {
        setQuery(value);
        clearTimeout(timerRef.current);
        if (value.length < 2) { setResults(null); setOpen(false); return; }
        timerRef.current = setTimeout(async () => {
            try {
                const res = await API.get(`/search?q=${encodeURIComponent(value)}`);
                setResults(res.data);
                setOpen(true);
            } catch { setResults(null); }
        }, 300);
    };

    const goTo = (path) => { setOpen(false); setQuery(''); navigate(path); };

    const goToResults = () => {
        if (query.trim().length < 2) return;
        setOpen(false);
        navigate(`/admin/search?q=${encodeURIComponent(query.trim())}`);
        setQuery('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') goToResults();
    };

    const total = results
        ? (results.products?.length || 0) + (results.materials?.length || 0) + (results.batches?.length || 0) + (results.orders?.length || 0)
        : 0;

    return (
        <div className="search-bar" ref={ref}>
            <Search className="search-icon" size={15} />
            <input
                type="text"
                placeholder="Search products, batches, materials..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => results && setOpen(true)}
                onKeyDown={handleKeyDown}
            />
            {open && (
                <div className="search-dropdown">
                    {total === 0 && <div className="search-empty">No results found for "{query}"</div>}

                    {results?.products?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><Package size={12} /> Products</div>
                            {results.products.slice(0, 3).map(p => (
                                <div key={p._id} className="search-item" onClick={() => goTo('/admin/products')}>
                                    <span className="search-item-name">{p.name}</span>
                                    <span className="search-item-meta">{p.sku} · ₹{p.pricePerUnit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.materials?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><Box size={12} /> Raw Materials</div>
                            {results.materials.slice(0, 3).map(m => (
                                <div key={m._id} className="search-item" onClick={() => goTo('/admin/inventory')}>
                                    <span className="search-item-name">{m.name}</span>
                                    <span className="search-item-meta">{m.currentStock} {m.unit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.batches?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><Layers size={12} /> Batches</div>
                            {results.batches.slice(0, 3).map(b => (
                                <div key={b._id} className="search-item" onClick={() => goTo('/admin/batches')}>
                                    <span className="search-item-name">{b.batchId}</span>
                                    <span className="search-item-meta">{b.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.orders?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><ShoppingCart size={12} /> Orders</div>
                            {results.orders.slice(0, 3).map(o => (
                                <div key={o._id} className="search-item" onClick={() => goTo('/admin/orders')}>
                                    <span className="search-item-name">{o.distributorId?.companyName || o.distributorId?.name}</span>
                                    <span className="search-item-meta">₹{o.totalAmount} · {o.status}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {total > 0 && (
                        <div style={{ borderTop: '1px solid #f1f5f9', padding: '8px 12px' }}>
                            <button onClick={goToResults} style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                fontSize: 12, fontWeight: 600, color: '#6366f1', background: '#f5f3ff',
                                border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer'
                            }}>
                                <span>View all {total} results for "{query}"</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
