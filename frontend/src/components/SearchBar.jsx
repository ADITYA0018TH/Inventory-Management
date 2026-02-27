import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as FiSearch, Package as FiPackage, Box as FiBox, Layers as FiLayers, ShoppingCart as FiShoppingCart } from 'lucide-react';
import API from '../api';

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

    const hasResults = results && (results.products?.length || results.materials?.length || results.batches?.length || results.orders?.length);

    return (
        <div className="search-bar" ref={ref}>
            <FiSearch className="search-icon" />
            <input
                type="text"
                placeholder="Search products, batches, materials..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => results && setOpen(true)}
            />
            {open && (
                <div className="search-dropdown">
                    {!hasResults && <div className="search-empty">No results found</div>}
                    {results?.products?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><FiPackage /> Products</div>
                            {results.products.map(p => (
                                <div key={p._id} className="search-item" onClick={() => goTo('/admin/products')}>
                                    <span className="search-item-name">{p.name}</span>
                                    <span className="search-item-meta">{p.sku} · ₹{p.pricePerUnit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.materials?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><FiBox /> Raw Materials</div>
                            {results.materials.map(m => (
                                <div key={m._id} className="search-item" onClick={() => goTo('/admin/inventory')}>
                                    <span className="search-item-name">{m.name}</span>
                                    <span className="search-item-meta">{m.currentStock} {m.unit}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.batches?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><FiLayers /> Batches</div>
                            {results.batches.map(b => (
                                <div key={b._id} className="search-item" onClick={() => goTo('/admin/batches')}>
                                    <span className="search-item-name">{b.batchId}</span>
                                    <span className="search-item-meta">{b.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {results?.orders?.length > 0 && (
                        <div className="search-group">
                            <div className="search-group-title"><FiShoppingCart /> Orders</div>
                            {results.orders.map(o => (
                                <div key={o._id} className="search-item" onClick={() => goTo('/admin/orders')}>
                                    <span className="search-item-name">{o.distributorId?.companyName || o.distributorId?.name}</span>
                                    <span className="search-item-meta">₹{o.totalAmount} · {o.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
