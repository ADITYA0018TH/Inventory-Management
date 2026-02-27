import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { ShoppingCart as FiShoppingCart } from 'lucide-react';

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        API.get('/products').then(res => setProducts(res.data)).catch(() => toast.error('Failed to load catalog'));
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(c => c.productId === product._id);
        if (existing) {
            setCart(cart.map(c => c.productId === product._id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { productId: product._id, name: product.name, pricePerUnit: product.pricePerUnit, quantity: 1 }]);
        }
        toast.success(`${product.name} added to cart`);
    };

    const updateQty = (productId, qty) => {
        if (qty <= 0) { setCart(cart.filter(c => c.productId !== productId)); return; }
        setCart(cart.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
    };

    const total = cart.reduce((sum, c) => sum + c.pricePerUnit * c.quantity, 0);

    const placeOrder = async () => {
        setLoading(true);
        try {
            await API.post('/orders', { items: cart.map(c => ({ productId: c.productId, quantity: c.quantity })) });
            toast.success('Order placed successfully!');
            setCart([]);
            setShowCart(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div><h1>Product Catalog</h1><p>Browse available medicines and place orders</p></div>
                <button className="btn btn-primary cart-btn" onClick={() => setShowCart(!showCart)}>
                    <FiShoppingCart /> Cart ({cart.length})
                </button>
            </div>

            {showCart && cart.length > 0 && (
                <div className="card cart-card">
                    <h3>Your Cart</h3>
                    <table className="data-table">
                        <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                        <tbody>
                            {cart.map(c => (
                                <tr key={c.productId}>
                                    <td>{c.name}</td>
                                    <td>₹{c.pricePerUnit}</td>
                                    <td><input type="number" className="qty-input" value={c.quantity} onChange={e => updateQty(c.productId, parseInt(e.target.value))} min="0" /></td>
                                    <td className="td-bold">₹{(c.pricePerUnit * c.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-footer">
                        <span className="cart-total">Total: ₹{total.toLocaleString()}</span>
                        <button className="btn btn-primary" onClick={placeOrder} disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</button>
                    </div>
                </div>
            )}

            <div className="products-grid">
                {products.map(p => (
                    <div key={p._id} className="card product-card catalog-card">
                        <div className="product-header">
                            <span className={`badge badge-${p.type.toLowerCase()}`}>{p.type}</span>
                        </div>
                        <h3>{p.name}</h3>
                        <p className="product-description">{p.description || 'Premium pharmaceutical product'}</p>
                        <div className="product-price">₹{p.pricePerUnit}/unit</div>
                        <button className="btn btn-primary btn-full" onClick={() => addToCart(p)}>
                            <FiShoppingCart /> Add to Cart
                        </button>
                    </div>
                ))}
                {products.length === 0 && <div className="empty-state">No products available at the moment</div>}
            </div>
        </div>
    );
}
