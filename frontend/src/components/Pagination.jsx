import { ChevronLeft as FiChevronLeft, ChevronRight as FiChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <FiChevronLeft />
            </button>
            {getPages().map(p => (
                <button
                    key={p}
                    className={`pagination-btn ${p === page ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </button>
            ))}
            <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                <FiChevronRight />
            </button>
            <span className="pagination-info">Page {page} of {totalPages}</span>
        </div>
    );
}
