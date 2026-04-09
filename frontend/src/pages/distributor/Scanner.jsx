import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { Camera, X, Search, CheckCircle, XCircle, ShieldCheck, Hash, User, Clock, Link as LinkIcon } from 'lucide-react';

export default function Scanner() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [chain, setChain] = useState(null);
    const [chainBlocks, setChainBlocks] = useState([]);
    const [manualInput, setManualInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const startScanner = async () => {
        setScanning(true);
        setResult(null);
        setChain(null);
        setChainBlocks([]);
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await scanner.stop();
                    setScanning(false);
                    handleScanResult(decodedText);
                },
                () => {}
            );
        } catch (err) {
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.stop(); } catch { /* silent */ }
        }
        setScanning(false);
    };

    const handleScanResult = async (data) => {
        setLoading(true);
        setResult(null);
        setChain(null);
        setChainBlocks([]);
        try {
            let batchId = data;
            try {
                const parsed = JSON.parse(data);
                batchId = parsed.batchId || data;
            } catch { /* plain batchId */ }

            const res = await API.get(`/batches/verify/${batchId}`);
            setResult(res.data);

            if (res.data.verified && res.data.batch?._id) {
                try {
                    const [chainRes, blocksRes] = await Promise.all([
                        API.get(`/batches/${res.data.batch._id}/verify-chain`),
                        API.get(`/batches/${res.data.batch._id}/chain`)
                    ]);
                    setChain(chainRes.data);
                    setChainBlocks(blocksRes.data.chain || []);
                } catch { /* no chain */ }
            }
        } catch {
            setResult({ verified: false, message: 'Batch not found. This product may be counterfeit.' });
        }
        setLoading(false);
    };

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (manualInput.trim()) handleScanResult(manualInput.trim());
    };

    useEffect(() => { return () => { stopScanner(); }; }, []);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>QR Code Scanner</h1>
                    <p>Scan or enter a batch ID to verify authenticity and view the blockchain trail</p>
                </div>
            </div>

            {/* Scanner card */}
            <div className="card" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
                <div style={{ textAlign: 'center' }}>
                    {!scanning ? (
                        <>
                            <div style={{
                                width: 72, height: 72, borderRadius: 20,
                                background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <Camera size={32} />
                            </div>
                            <h3 style={{ marginBottom: 6 }}>Verify Batch Authenticity</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Use your camera to scan the QR code on the product packaging
                            </p>
                            <button className="btn btn-primary" onClick={startScanner} style={{ marginBottom: 20 }}>
                                <Camera size={16} /> Start Camera Scanner
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or enter manually</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>
                            <form onSubmit={handleManualVerify} style={{ display: 'flex', gap: 8 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value)}
                                        placeholder="e.g. AST-2026-001"
                                        style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '...' : 'Verify'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-ghost" onClick={stopScanner} style={{ marginBottom: 12 }}>
                                <X size={15} /> Stop Scanner
                            </button>
                        </>
                    )}
                    <div id="qr-reader" ref={scannerRef} style={{ maxWidth: 360, margin: '0 auto' }} />
                </div>
            </div>

            {/* Verification result */}
            {result && (
                <div style={{ maxWidth: 560, margin: '0 auto 20px' }}>
                    <div className="card" style={{
                        borderLeft: `4px solid ${result.verified ? '#10b981' : '#ef4444'}`,
                        background: result.verified ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: result.verified ? 16 : 0 }}>
                            {result.verified
                                ? <CheckCircle size={24} color="#10b981" />
                                : <XCircle size={24} color="#ef4444" />}
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: result.verified ? '#10b981' : '#ef4444' }}>
                                    {result.verified ? 'Verified — Authentic Product' : 'Verification Failed'}
                                </div>
                                {!result.verified && (
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                                        {result.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {result.verified && result.batch && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                                {[
                                    ['Batch ID', result.batch.batchId],
                                    ['Product', result.batch.productId?.name],
                                    ['Type', result.batch.productId?.type],
                                    ['SKU', result.batch.productId?.sku],
                                    ['Qty Produced', result.batch.quantityProduced],
                                    ['Status', result.batch.status],
                                    ['Mfg Date', new Date(result.batch.mfgDate).toLocaleDateString()],
                                    ['Exp Date', new Date(result.batch.expDate).toLocaleDateString()],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chain integrity summary */}
            {chain && (
                <div style={{ maxWidth: 560, margin: '0 auto 20px' }}>
                    <div className="card" style={{
                        borderLeft: `4px solid ${chain.isValid ? '#10b981' : '#ef4444'}`,
                        display: 'flex', alignItems: 'center', gap: 14
                    }}>
                        <ShieldCheck size={28} color={chain.isValid ? '#10b981' : '#ef4444'} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: chain.isValid ? '#10b981' : '#ef4444' }}>
                                {chain.message}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {chain.chainLength} blocks in the hash chain
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full hash chain block viewer */}
            {chainBlocks.length > 0 && (
                <div style={{ maxWidth: 560, margin: '0 auto' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Hash size={18} color="#6366f1" /> Blockchain Audit Trail
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {chainBlocks.map((block, i) => (
                                <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < chainBlocks.length - 1 ? 24 : 0 }}>
                                    {/* Timeline line */}
                                    {i < chainBlocks.length - 1 && (
                                        <div style={{
                                            position: 'absolute', left: 15, top: 32, bottom: 0,
                                            width: 2, background: 'linear-gradient(to bottom, #6366f1, #e2e8f0)'
                                        }} />
                                    )}
                                    {/* Block number dot */}
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                        background: i === 0 ? '#6366f1' : '#f1f5f9',
                                        border: `2px solid ${i === 0 ? '#6366f1' : '#e2e8f0'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, fontWeight: 700,
                                        color: i === 0 ? '#fff' : '#64748b',
                                        zIndex: 1
                                    }}>
                                        {i + 1}
                                    </div>
                                    {/* Block content */}
                                    <div style={{
                                        flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: 10, padding: '12px 14px', marginBottom: 0
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                                            {block.event}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                                <Hash size={11} color="#6366f1" />
                                                <span style={{ color: '#64748b' }}>Hash:</span>
                                                <code style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: 10, wordBreak: 'break-all' }}>
                                                    {block.hash?.slice(0, 32)}...
                                                </code>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                                <LinkIcon size={11} color="#94a3b8" />
                                                <span style={{ color: '#64748b' }}>Prev:</span>
                                                <code style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 10 }}>
                                                    {block.previousHash === '0' ? 'Genesis (0)' : block.previousHash?.slice(0, 20) + '...'}
                                                </code>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, marginTop: 2 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                                                    <User size={11} /> {block.actor || 'System'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                                                    <Clock size={11} /> {new Date(block.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
