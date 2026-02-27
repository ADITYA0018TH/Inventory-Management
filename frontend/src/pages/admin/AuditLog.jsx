import { useState, useEffect } from 'react';
import { FileText as FiFileText } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';
import { SkeletonTable } from '../../components/SkeletonLoader';

export default function AuditLog() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadLogs(); }, [page]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/audit?page=${page}&limit=15`);
            setLogs(res.data.logs);
            setTotalPages(res.data.pagination.totalPages);
        } catch { toast.error('Failed to load audit logs'); }
        finally { setLoading(false); }
    };

    const getActionColor = (action) => {
        if (action.includes('Created') || action.includes('Registered')) return 'badge-green';
        if (action.includes('Deleted') || action.includes('Deactivated')) return 'badge-amber';
        if (action.includes('Updated') || action.includes('Changed')) return 'badge-blue';
        if (action.includes('Logged')) return 'badge-purple';
        return 'badge-blue';
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1><FiFileText style={{ marginRight: 8 }} /> Audit Log</h1>
                    <p>Track all system activities</p>
                </div>
            </div>

            <div className="card">
                {loading ? <SkeletonTable rows={10} cols={5} /> : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="empty-table">No audit logs yet</td></tr>
                                ) : logs.map(log => (
                                    <tr key={log._id}>
                                        <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="td-bold">{log.userName || 'System'}</td>
                                        <td><span className={`badge ${getActionColor(log.action)}`}>{log.action}</span></td>
                                        <td>{log.entity}</td>
                                        <td>{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}
