import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'distributor', companyName: '', gstNumber: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await register(form);
            toast.success(`Welcome, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-branding">
                        <img src="/src/assets/logo.png" alt="PharmaLink" className="auth-logo" />
                        <h1>PharmaLink</h1>
                        <p>Supply Chain & Inventory Management System</p>
                    </div>
                </div>
                <div className="auth-right">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <h2>Create Account</h2>
                        <p className="auth-subtitle">Register to get started</p>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="distributor">Distributor</option>
                                    <option value="admin">Admin / Manufacturer</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        {form.role === 'distributor' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="ABC Distributors" />
                                </div>
                                <div className="form-group">
                                    <label>GST Number</label>
                                    <input type="text" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                                </div>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                        <p className="auth-footer">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
