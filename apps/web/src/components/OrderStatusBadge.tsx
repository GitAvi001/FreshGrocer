import type { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: '⏳ Pending', className: 'badge badge-yellow' },
    confirmed: { label: '✅ Confirmed', className: 'badge badge-blue' },
    preparing: { label: '👨‍🍳 Preparing', className: 'badge badge-blue' },
    out_for_delivery: { label: '🚚 Out for Delivery', className: 'badge badge-orange' },
    delivered: { label: '📬 Delivered', className: 'badge badge-green' },
    cancelled: { label: '❌ Cancelled', className: 'badge badge-red' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config = statusConfig[status];
    return <span className={config.className}>{config.label}</span>;
}
