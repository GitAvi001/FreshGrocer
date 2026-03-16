import type { ExpirationStatus } from '@/types';

const statusConfig: Record<ExpirationStatus, { label: string; className: string }> = {
    expired: { label: '⛔ Expired', className: 'badge badge-red' },
    critical: { label: '🔴 Critical', className: 'badge badge-orange' },
    warning: { label: '🟡 Warning', className: 'badge badge-yellow' },
    normal: { label: '🟢 Fresh', className: 'badge badge-green' },
    'n/a': { label: 'Non-perishable', className: 'badge badge-gray' },
};

export default function ExpirationBadge({
    status,
    daysUntilExpiration,
}: {
    status: ExpirationStatus;
    daysUntilExpiration?: number | null;
}) {
    const config = statusConfig[status];
    return (
        <span className={config.className} title={daysUntilExpiration != null ? `${daysUntilExpiration} days left` : undefined}>
            {config.label}
            {daysUntilExpiration != null && status !== 'expired' && status !== 'n/a' && (
                <span style={{ opacity: 0.7 }}> ({daysUntilExpiration}d)</span>
            )}
        </span>
    );
}
