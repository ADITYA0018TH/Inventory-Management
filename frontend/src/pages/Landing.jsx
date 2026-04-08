import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';
import { motion } from 'framer-motion';
import {
    Package, Layers, ShieldCheck, TrendingUp, Thermometer, AlertTriangle,
    QrCode, BarChart3, Bell, FileText, Truck, RotateCcw, CheckCircle,
    ArrowRight, Zap, Lock, MapPin, Mail, ArrowUp, Github, Twitter, Linkedin
} from 'lucide-react';

// ── Mock UI Components ──────────────────────────────────────────────────────

function MockDashboard() {
    return (
        <div className="mock-ui">
            <div className="mock-topbar">
                <div className="mock-logo-row">
                    <img src="/logo.svg" alt="" className="mock-logo" />
                    <span className="mock-brand">PharmaLink</span>
                </div>
                <div className="mock-topbar-dots">
                    <span /><span /><span />
                </div>
            </div>
            <div className="mock-body">
                <div className="mock-sidebar">
                    {['Dashboard', 'Inventory', 'Batches', 'Orders', 'Quality', 'Compliance'].map((item, i) => (
                        <div key={item} className={`mock-nav-item ${i === 0 ? 'active' : ''}`}>{item}</div>
                    ))}
                </div>
                <div className="mock-content">
                    <div className="mock-stats-row">
                        {[
                            { label: 'Products', val: '24', color: '#6366f1' },
                            { label: 'Batches', val: '138', color: '#06b6d4' },
                            { label: 'Revenue', val: '₹4.2L', color: '#10b981' },
                            { label: 'Orders', val: '12', color: '#f59e0b' },
                        ].map(s => (
                            <div key={s.label} className="mock-stat">
                                <div className="mock-stat-val" style={{ color: s.color }}>{s.val}</div>
                                <div className="mock-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mock-charts-row">
                        <div className="mock-chart-card">
                            <div className="mock-chart-title">Production Volume</div>
                            <div className="mock-bars">
                                {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
                                    <div key={i} className="mock-bar" style={{ height: h + '%', background: '#6366f1' }} />
                                ))}
                            </div>
                        </div>
                        <div className="mock-chart-card">
                            <div className="mock-chart-title">Order Status</div>
                            <div className="mock-donut-wrap">
                                <svg viewBox="0 0 36 36" className="mock-donut">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="4"
                                        strokeDasharray="44 44" strokeDashoffset="11" strokeLinecap="round" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4"
                                        strokeDasharray="22 66" strokeDashoffset="-33" strokeLinecap="round" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4"
                                        strokeDasharray="22 66" strokeDashoffset="-55" strokeLinecap="round" />
                                </svg>
                                <div className="mock-donut-legend">
                                    {[['#6366f1', 'Delivered'], ['#10b981', 'Shipped'], ['#f59e0b', 'Pending']].map(([c, l]) => (
                                        <div key={l} className="mock-legend-item">
                                            <span style={{ background: c }} />
                                            <span>{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MockCompliance() {
    return (
        <div className="mock-ui mock-ui-sm">
            <div className="mock-card-header">Compliance Score</div>
            <div className="mock-score-ring">
                <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
                        strokeDasharray="79 22" strokeDashoffset="11" strokeLinecap="round" />
                </svg>
                <span>87%</span>
            </div>
            <div className="mock-metrics">
                {[
                    ['Batch Testing', '92%', '#10b981'],
                    ['Storage', '88%', '#6366f1'],
                    ['Recall Response', '100%', '#10b981'],
                    ['Fulfillment', '79%', '#f59e0b'],
                ].map(([label, val, color]) => (
                    <div key={label} className="mock-metric-row">
                        <span className="mock-metric-label">{label}</span>
                        <div className="mock-metric-bar-wrap">
                            <div className="mock-metric-bar" style={{ width: val, background: color }} />
                        </div>
                        <span className="mock-metric-val" style={{ color }}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MockBatchChain() {
    return (
        <div className="mock-ui mock-ui-sm">
            <div className="mock-card-header">Batch Hash Chain</div>
            <div className="mock-chain">
                {[
                    { event: 'Batch Created', hash: 'a3f9...2c1d', prev: '0000', actor: 'Admin' },
                    { event: 'Quality Check', hash: 'b7e2...9a4f', prev: 'a3f9', actor: 'Inspector' },
                    { event: 'Released', hash: 'c1d8...3b7e', prev: 'b7e2', actor: 'Admin' },
                    { event: 'Shipped', hash: 'd4a1...6c2f', prev: 'c1d8', actor: 'Admin' },
                ].map((block, i) => (
                    <div key={i} className="mock-block">
                        <div className="mock-block-dot" />
                        {i < 3 && <div className="mock-block-line" />}
                        <div className="mock-block-content">
                            <div className="mock-block-event">{block.event}</div>
                            <div className="mock-block-hash">#{block.hash}</div>
                            <div className="mock-block-actor">{block.actor}</div>
                        </div>
                        <div className="mock-block-verified">✓</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MockForecasting() {
    const points = [30, 45, 38, 60, 52, 70, 65, 80, 72, 88, 82, 95];
    const ewma =  [30, 36, 37, 44, 46, 54, 57, 65, 67, 74, 76, 83];
    const w = 220, h = 80;
    const toX = (i) => (i / (points.length - 1)) * w;
    const toY = (v) => h - (v / 100) * h;
    const path = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

    return (
        <div className="mock-ui mock-ui-sm">
            <div className="mock-card-header">Demand Forecasting — SMA vs EWMA</div>
            <svg viewBox={`0 0 ${w} ${h}`} className="mock-line-chart">
                <path d={path(points)} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                <path d={path(ewma)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" />
            </svg>
            <div className="mock-chart-legend">
                <span style={{ color: '#6366f1' }}>— SMA Forecast</span>
                <span style={{ color: '#10b981' }}>-- EWMA Forecast</span>
            </div>
        </div>
    );
}

function MockQR() {
    return (
        <div className="mock-ui mock-ui-sm mock-qr-ui">
            <div className="mock-card-header">Batch Verification</div>
            <div className="mock-qr-body">
                <div className="mock-qr-code">
                    <svg viewBox="0 0 21 21" fill="none">
                        {/* QR pattern */}
                        {[
                            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
                            [0,1],[6,1],[0,2],[2,2],[3,2],[4,2],[6,2],
                            [0,3],[2,3],[4,3],[6,3],[0,4],[2,4],[3,4],[4,4],[6,4],
                            [0,5],[6,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
                            [8,0],[10,0],[12,0],[9,1],[11,1],[8,2],[10,2],[12,2],
                            [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],
                            [14,1],[20,1],[14,2],[16,2],[17,2],[18,2],[20,2],
                            [14,3],[16,3],[18,3],[20,3],[14,4],[16,4],[17,4],[18,4],[20,4],
                            [14,5],[20,5],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],
                            [0,14],[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],
                            [0,15],[6,15],[0,16],[2,16],[3,16],[4,16],[6,16],
                            [0,17],[2,17],[4,17],[6,17],[0,18],[2,18],[3,18],[4,18],[6,18],
                            [0,19],[6,19],[0,20],[1,20],[2,20],[3,20],[4,20],[5,20],[6,20],
                            [8,8],[9,8],[11,8],[13,8],[8,9],[10,9],[12,9],[9,10],[11,10],[13,10],
                            [8,11],[10,11],[12,11],[9,12],[11,12],[13,12],[8,13],[10,13],[12,13],
                        ].map(([x, y], i) => (
                            <rect key={i} x={x} y={y} width="1" height="1" fill="#1e293b" />
                        ))}
                    </svg>
                </div>
                <div className="mock-qr-details">
                    <div className="mock-qr-row"><span>Batch</span><strong>AST-2026-042</strong></div>
                    <div className="mock-qr-row"><span>Product</span><strong>Aster Cold Relief</strong></div>
                    <div className="mock-qr-row"><span>Mfg</span><strong>Jan 2026</strong></div>
                    <div className="mock-qr-row"><span>Exp</span><strong>Jan 2028</strong></div>
                    <div className="mock-verified-badge"><CheckCircle size={12} /> Verified Authentic</div>
                </div>
            </div>
        </div>
    );
}

// ── Feature Cards ────────────────────────────────────────────────────────────

const features = [
    {
        icon: <Layers size={22} />,
        color: '#6366f1',
        title: 'Blockchain Batch Traceability',
        desc: 'Every batch gets a SHA-256 hash chain recording all lifecycle events — creation, QC, release, shipment. Tamper-evident and verifiable.',
        mock: <MockBatchChain />,
    },
    {
        icon: <QrCode size={22} />,
        color: '#06b6d4',
        title: 'QR Anti-Counterfeiting',
        desc: 'Each batch generates a unique QR code. Anyone can scan to verify authenticity instantly — no login required.',
        mock: <MockQR />,
    },
    {
        icon: <TrendingUp size={22} />,
        color: '#10b981',
        title: 'Demand Forecasting',
        desc: 'SMA and EWMA models predict next-month demand per product using 12 months of order history. Plan production before stockouts happen.',
        mock: <MockForecasting />,
    },
    {
        icon: <ShieldCheck size={22} />,
        color: '#8b5cf6',
        title: 'Compliance Scoring',
        desc: 'A weighted GMP compliance score across 5 dimensions — batch testing, storage, expiry, recalls, and fulfillment — with audit readiness checklist.',
        mock: <MockCompliance />,
    },
    {
        icon: <Thermometer size={22} />,
        color: '#f59e0b',
        title: 'Storage Compliance',
        desc: 'Log temperature and humidity per batch. Violations auto-detected against product storage conditions. Bulk CSV import for data loggers.',
    },
    {
        icon: <AlertTriangle size={22} />,
        color: '#ef4444',
        title: 'Drug Recall Management',
        desc: 'Initiate Class I/II/III recalls with automatic email to all affected distributors. Impact analysis shows units affected and financial exposure.',
    },
    {
        icon: <BarChart3 size={22} />,
        color: '#06b6d4',
        title: 'ABC Inventory Analysis',
        desc: 'Pareto-based classification of products by revenue contribution. Category A/B/C drives procurement priorities and safety stock decisions.',
    },
    {
        icon: <Bell size={22} />,
        color: '#6366f1',
        title: 'Real-Time Notifications',
        desc: 'WebSocket-powered push notifications for order updates, low stock alerts, and recall initiations. No polling, sub-second delivery.',
    },
    {
        icon: <Truck size={22} />,
        color: '#10b981',
        title: 'Shipment Tracking',
        desc: 'Full order lifecycle from Pending → Approved → Shipped → Delivered with timestamped location history and PDF invoice generation.',
    },
    {
        icon: <FileText size={22} />,
        color: '#8b5cf6',
        title: 'Audit Logging',
        desc: 'Every action is recorded with user identity, entity, and timestamp. Append-only design ensures the compliance trail is never altered.',
    },
    {
        icon: <RotateCcw size={22} />,
        color: '#f59e0b',
        title: 'Returns Management',
        desc: 'Distributors can raise return requests. Admins approve, reject, or complete them with full traceability back to the original order and batch.',
    },
    {
        icon: <Package size={22} />,
        color: '#ef4444',
        title: 'Formula-Based Production',
        desc: 'Define product formulas with raw material quantities. Batch creation atomically deducts materials — rolls back if stock is insufficient.',
    },
];

const stats = [
    { val: '16', label: 'Data Models' },
    { val: '20', label: 'API Route Groups' },
    { val: '19', label: 'Admin Pages' },
    { val: '2FA', label: 'Security Layers' },
];

// ── Landing Page ─────────────────────────────────────────────────────────────

export default function Landing() {
    return (
        <div className="landing">

            {/* NAV */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-nav-logo">
                        <img src="/logo.svg" alt="PharmaLink" className="bg-white rounded-lg p-1" style={{ width: 36, height: 36 }} />
                        <span>PharmaLink</span>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#features">Features</a>
                        <a href="#tech">Tech Stack</a>
                        <Link to="/login" className="landing-nav-cta">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="landing-hero">
                <div className="landing-hero-badge">
                    <Zap size={13} /> Pharmaceutical Supply Chain Platform
                </div>
                <h1 className="landing-hero-title">
                    <SplitText
                        text="End-to-End Pharma Supply Chain"
                        tag="span"
                        splitType="chars"
                        delay={30}
                        duration={0.8}
                        ease="power3.out"
                        from={{ opacity: 0, y: 30 }}
                        to={{ opacity: 1, y: 0 }}
                        textAlign="center"
                        className="block"
                    />
                    <br />
                    <span className="landing-hero-gradient landing-hero-gradient-animate block">
                        Intelligence &amp; Traceability
                    </span>
                </h1>
                <p className="landing-hero-sub">
                    From raw material procurement to final delivery — PharmaLink brings blockchain-inspired traceability,
                    real-time compliance scoring, demand forecasting, and QR anti-counterfeiting into one unified platform.
                </p>
                <div className="landing-hero-actions">
                    <Link to="/login" className="landing-btn-primary">
                        Get Started <ArrowRight size={16} />
                    </Link>
                    <Link to="/register" className="landing-btn-ghost">
                        Create Account
                    </Link>
                </div>

                {/* Hero mock */}
                <div className="landing-hero-mock">
                    <MockDashboard />
                </div>
            </section>

            {/* STATS */}
            <section className="landing-stats">
                {stats.map(s => (
                    <div key={s.label} className="landing-stat">
                        <div className="landing-stat-val">{s.val}</div>
                        <div className="landing-stat-label">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* FEATURES */}
            <section className="landing-features" id="features">
                <div className="landing-section-label">Features</div>
                <h2 className="landing-section-title">Everything your pharma supply chain needs</h2>
                <p className="landing-section-sub">
                    Built for small and medium pharmaceutical manufacturers who need enterprise-grade tools without enterprise-grade cost.
                </p>

                <div className="landing-features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="landing-feature-card">
                            <div className="landing-feature-icon" style={{ background: f.color + '18', color: f.color }}>
                                {f.icon}
                            </div>
                            <h3 className="landing-feature-title">{f.title}</h3>
                            <p className="landing-feature-desc">{f.desc}</p>
                            {f.mock && (
                                <div className="landing-feature-mock">
                                    {f.mock}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* TECH STACK */}
            <section className="landing-tech" id="tech">
                <div className="landing-section-label">Tech Stack</div>
                <h2 className="landing-section-title">Built on modern, proven technologies</h2>
                <div className="landing-tech-grid">
                    {[
                        { name: 'React 19', role: 'Frontend', color: '#06b6d4' },
                        { name: 'Node.js', role: 'Backend', color: '#10b981' },
                        { name: 'Express.js', role: 'API Server', color: '#6366f1' },
                        { name: 'MongoDB', role: 'Database', color: '#10b981' },
                        { name: 'Socket.io', role: 'Real-Time', color: '#f59e0b' },
                        { name: 'JWT + 2FA', role: 'Security', color: '#8b5cf6' },
                        { name: 'Recharts', role: 'Analytics', color: '#ef4444' },
                        { name: 'Tailwind CSS', role: 'Styling', color: '#06b6d4' },
                    ].map(t => (
                        <div key={t.name} className="landing-tech-card">
                            <div className="landing-tech-dot" style={{ background: t.color }} />
                            <div className="landing-tech-name">{t.name}</div>
                            <div className="landing-tech-role">{t.role}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lf-footer">
                {/* CTA Banner */}
                <div className="lf-cta-banner">
                    <div className="lf-cta-inner">
                        <div>
                            <p className="lf-cta-eyebrow">Pharmaceutical Supply Chain</p>
                            <h3 className="lf-cta-title">Ready to digitize your supply chain?</h3>
                            <p className="lf-cta-sub">Blockchain traceability, compliance scoring, and demand forecasting — all in one platform.</p>
                        </div>
                        <div className="lf-cta-actions">
                            <Link to="/login" className="landing-btn-primary">Get Started <ArrowRight size={15} /></Link>
                            <Link to="/register" className="landing-btn-ghost">Create Account</Link>
                        </div>
                    </div>
                </div>

                {/* Main footer grid */}
                <div className="lf-main">
                    {/* Brand col */}
                    <div className="lf-col">
                        <div className="lf-brand">
                            <img src="/logo.svg" alt="PharmaLink" className="bg-white rounded-lg p-1" style={{ width: 36, height: 36 }} />
                            <span className="lf-brand-name">PharmaLink</span>
                        </div>
                        <p className="lf-brand-desc">AI-powered pharmaceutical supply chain management. Built for manufacturers and distributors who need enterprise-grade tools without enterprise cost.</p>
                        <div className="lf-status">
                            <span className="lf-status-dot" />
                            All systems operational
                        </div>
                        {/* Social */}
                        <div className="lf-social">
                            {[
                                { icon: Github, label: 'GitHub', href: '#' },
                                { icon: Twitter, label: 'Twitter', href: '#' },
                                { icon: Linkedin, label: 'LinkedIn', href: '#' },
                            ].map(({ icon: Icon, label, href }) => (
                                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                                    aria-label={label} whileHover={{ y: -3 }}
                                    className="lf-social-btn">
                                    <Icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Nav col */}
                    <div className="lf-col">
                        <h5 className="lf-col-title">Platform</h5>
                        <nav className="lf-nav">
                            {['Dashboard', 'Batch Traceability', 'Quality Control', 'Compliance', 'Forecasting', 'Drug Recalls'].map(item => (
                                <Link key={item} to="/login" className="lf-nav-link">
                                    <span className="lf-nav-dot" />{item}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Features col */}
                    <div className="lf-col">
                        <h5 className="lf-col-title">Features</h5>
                        <nav className="lf-nav">
                            {['QR Anti-Counterfeiting', 'Storage Compliance', 'ABC Analysis', 'Real-Time Alerts', 'Audit Logging', 'Shipment Tracking'].map(item => (
                                <Link key={item} to="/login" className="lf-nav-link">
                                    <span className="lf-nav-dot" />{item}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact col */}
                    <div className="lf-col">
                        <h5 className="lf-col-title">Contact</h5>
                        <div className="lf-contact">
                            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="lf-contact-item">
                                <MapPin size={14} className="lf-contact-icon" />
                                <span>Vadodara, Gujarat, India</span>
                            </a>
                            <a href="mailto:support@pharmalink.com" className="lf-contact-item">
                                <Mail size={14} className="lf-contact-icon" />
                                <span>support@pharmalink.com</span>
                            </a>
                        </div>
                        <motion.button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            whileHover={{ x: 4 }} whileTap={{ scale: 0.96 }}
                            className="lf-back-top">
                            <ArrowUp size={14} /> Back to top
                        </motion.button>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="lf-bottom">
                    <p className="lf-copyright">© {new Date().getFullYear()} PharmaLink. Built with the MERN Stack.</p>
                    <div className="lf-badges">
                        {['Blockchain Secured', 'GMP Compliant', 'MERN Stack'].map(b => (
                            <span key={b} className="lf-badge">{b}</span>
                        ))}
                    </div>
                </div>

                {/* Large background wordmark */}
                <div className="lf-wordmark" aria-hidden="true">PharmaLink</div>
            </footer>
        </div>
    );
}
