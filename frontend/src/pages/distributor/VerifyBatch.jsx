import { useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function VerifyBatch() {
    const [batchId, setBatchId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const res = await API.get(`/batches/verify/${batchId}`);
            setResult(res.data);
        } catch (err) {
            setResult({ verified: false, message: err.response?.data?.message || 'Batch not found' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header"><div><h1>Verify Batch</h1><p>Check if a medicine batch is genuine</p></div></div>

            <div className="card verify-card">
                <form onSubmit={handleVerify} className="verify-form">
                    <div className="form-group">
                        <label>Enter Batch ID</label>
                        <div className="search-input-group">
                            <input type="text" value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="e.g. AST-2026-001" required />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <FiSearch /> {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                </form>

                {searched && result && (
                    <div className={`verify-result ${result.verified ? 'verified' : 'not-verified'}`}>
                        {result.verified ? (
                            <>
                                <div className="verify-header success">
                                    <FiCheckCircle size={48} />
                                    <h2>Genuine Product ✓</h2>
                                    <p>This batch has been verified as authentic</p>
                                </div>
                                <div className="verify-details">
                                    <div className="detail-row"><span>Batch ID:</span><span>{result.batch.batchId}</span></div>
                                    <div className="detail-row"><span>Product:</span><span>{result.batch.productId?.name}</span></div>
                                    <div className="detail-row"><span>Type:</span><span>{result.batch.productId?.type}</span></div>
                                    <div className="detail-row"><span>Manufacture Date:</span><span>{new Date(result.batch.mfgDate).toLocaleDateString()}</span></div>
                                    <div className="detail-row"><span>Expiry Date:</span><span>{new Date(result.batch.expDate).toLocaleDateString()}</span></div>
                                    <div className="detail-row"><span>Status:</span><span>{result.batch.status}</span></div>
                                    <div className="detail-row"><span>Quantity:</span><span>{result.batch.quantityProduced?.toLocaleString()} units</span></div>
                                </div>
                                {result.batch.qrCodeData && (
                                    <div className="qr-container">
                                        <img src={result.batch.qrCodeData} alt="QR Code" className="qr-image" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="verify-header danger">
                                <FiXCircle size={48} />
                                <h2>Not Verified ✕</h2>
                                <p>{result.message || 'This batch could not be verified. It may be counterfeit.'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
