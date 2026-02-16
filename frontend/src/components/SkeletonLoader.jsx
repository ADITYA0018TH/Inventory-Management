export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-line skeleton-lg"></div>
            <div className="skeleton-line skeleton-sm"></div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="skeleton-table">
            <div className="skeleton-row skeleton-header">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="skeleton-line skeleton-md"></div>
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="skeleton-row">
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} className="skeleton-line skeleton-md"></div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonChart() {
    return (
        <div className="skeleton-chart">
            <div className="skeleton-line skeleton-lg"></div>
            <div className="skeleton-bars">
                {[60, 80, 45, 90, 55, 70].map((h, i) => (
                    <div key={i} className="skeleton-bar" style={{ height: `${h}%` }}></div>
                ))}
            </div>
        </div>
    );
}
