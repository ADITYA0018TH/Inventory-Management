import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Scanner() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [manualInput, setManualInput] = useState('');
    const [chain, setChain] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const startScanner = async () => {
        setScanning(true);
        setResult(null);
        setChain(null);
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
                () => { }
            );
        } catch (err) {
            setScanning(false);
            console.error('Scanner error:', err);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.stop(); } catch { /* silent */ }
        }
        setScanning(false);
    };

    const handleScanResult = async (data) => {
        try {
            let batchId = data;
            try {
                const parsed = JSON.parse(data);
                batchId = parsed.batchId || data;
            } catch { /* treat as plain batchId */ }

            const res = await API.get(`/batches/verify/${batchId}`);
            setResult(res.data);

            // Load blockchain chain if batch found
            if (res.data.verified && res.data.batch?._id) {
                try {
                    const chainRes = await API.get(`/batches/${res.data.batch._id}/verify-chain`);
                    setChain(chainRes.data);
                } catch { /* no chain */ }
            }
        } catch {
            setResult({ verified: false, message: 'Batch not found. This product may be counterfeit.' });
        }
    };

    const handleManualVerify = (e) => {
        e.preventDefault();
        if (manualInput.trim()) handleScanResult(manualInput.trim());
    };

    useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>QR Code Scanner</h1>
                    <p>Scan a batch QR code to verify authenticity</p>
                </div>
            </div>

            <div className="card text-center mb-5">
                {!scanning ? (
                    <div>
                        <Button onClick={startScanner} size="lg">
                            <Camera className="mr-2 h-4 w-4" /> Start Scanner
                        </Button>
                        <div className="my-5 text-muted-foreground">— or enter batch ID manually —</div>
                        <form onSubmit={handleManualVerify} className="flex gap-2 justify-center">
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-w-[300px]" value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Enter Batch ID (e.g. AST-2026-001)" />
                            <Button type="submit">Verify</Button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <Button variant="outline" onClick={stopScanner} className="mb-3">
                            <X className="mr-2 h-4 w-4" /> Stop Scanner
                        </Button>
                    </div>
                )}
                <div id="qr-reader" ref={scannerRef} style={{ maxWidth: 400, margin: '0 auto' }} />
            </div>

            {result && (
                <div className={`card card-bordered-left ${result.verified ? 'card-border-green' : 'card-border-red'}`}>
                    <h3>{result.verified ? 'Verified — Authentic Product' : 'Verification Failed'}</h3>
                    {result.verified && result.batch ? (
                        <div className="grid-2 mt-3">
                            <div><strong>Batch ID:</strong> {result.batch.batchId}</div>
                            <div><strong>Product:</strong> {result.batch.productId?.name}</div>
                            <div><strong>Type:</strong> {result.batch.productId?.type}</div>
                            <div><strong>SKU:</strong> {result.batch.productId?.sku}</div>
                            <div><strong>Qty Produced:</strong> {result.batch.quantityProduced}</div>
                            <div><strong>Status:</strong> <span className={`status-badge ${result.batch.status === 'Released' ? 'delivered' : 'pending'}`}>{result.batch.status}</span></div>
                            <div><strong>Mfg Date:</strong> {new Date(result.batch.mfgDate).toLocaleDateString()}</div>
                            <div><strong>Exp Date:</strong> {new Date(result.batch.expDate).toLocaleDateString()}</div>
                        </div>
                    ) : (
                        <p className="text-danger">{result.message || 'This product could not be verified.'}</p>
                    )}
                </div>
            )}

            {chain && (
                <div className={`card mt-4 card-bordered-left ${chain.isValid ? 'card-border-green' : 'card-border-red'}`}>
                    <h3>Supply Chain Integrity</h3>
                    <p className={`font-semibold ${chain.isValid ? 'text-success' : 'text-danger'}`}>{chain.message}</p>
                    <p className="text-xs text-secondary-color">Chain length: {chain.chainLength} blocks</p>
                </div>
            )}
        </div>
    );
}
