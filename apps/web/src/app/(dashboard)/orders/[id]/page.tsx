'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import type { Order, OrderStatus } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'out_for_delivery',
    out_for_delivery: 'delivered',
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [driverId, setDriverId] = useState('');
    const [error, setError] = useState('');
    const user = typeof window !== 'undefined' ? getUser() : null;
    const isAdmin = user?.role === 'admin';
    const canUpdate = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        ordersApi.getById(Number(id))
            .then(setOrder)
            .catch(() => router.push('/orders'))
            .finally(() => setLoading(false));
    }, [id, router]);

    const advanceStatus = async () => {
        if (!order) return;
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        setUpdating(true); setError('');
        try { setOrder(await ordersApi.updateStatus(order.id, next)); }
        catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
        finally { setUpdating(false); }
    };

    const handleCancel = async () => {
        if (!order || !confirm('Cancel this order?')) return;
        setUpdating(true); setError('');
        try { await ordersApi.cancel(order.id); router.push('/orders'); }
        catch (e) { setError(e instanceof Error ? e.message : 'Cancel failed'); }
        finally { setUpdating(false); }
    };

    const handleAssignDriver = async () => {
        if (!order || !driverId) return;
        setUpdating(true); setError('');
        try { setOrder(await ordersApi.assignDriver(order.id, Number(driverId))); setDriverId(''); }
        catch (e) { setError(e instanceof Error ? e.message : 'Driver assignment failed'); }
        finally { setUpdating(false); }
    };

    if (loading || !order) return <div style={{ color: 'var(--color-text-muted)' }}>Loading order...</div>;

    const currentStep = STATUS_STEPS.indexOf(order.status);

    return (
        <div style={{ maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <button onClick={() => router.push('/orders')} className="btn btn-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Orders</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Order #{order.id}</h1>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>

            {/* Progress Tracker */}
            {order.status !== 'cancelled' && (
                <div className="card">
                    <p className="label" style={{ marginBottom: '1rem' }}>Delivery Progress</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                        {STATUS_STEPS.map((step, i) => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'initial' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                    background: i <= currentStep ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                                    color: i <= currentStep ? '#fff' : 'var(--color-text-muted)',
                                    border: i === currentStep ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    boxShadow: i === currentStep ? '0 0 0 3px rgba(63,185,80,0.2)' : 'none',
                                }}>
                                    {i < currentStep ? '✓' : i + 1}
                                </div>
                                <div style={{ marginLeft: '0.5rem', display: i < STATUS_STEPS.length - 1 ? 'none' : 'block' }}>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: i <= currentStep ? 'var(--color-text)' : 'var(--color-text-muted)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                                        {step.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                {i < STATUS_STEPS.length - 1 && (
                                    <>
                                        <div style={{ margin: '0 0.25rem 0 0.5rem', fontSize: '0.7rem', color: i <= currentStep ? 'var(--color-text-muted)' : 'var(--color-border)', flexShrink: 0 }}>
                                            {step.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ flex: 1, height: '2px', background: i < currentStep ? 'var(--color-primary)' : 'var(--color-border)', margin: '0 0.5rem' }} />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Details */}
            <div className="card">
                <p className="label" style={{ marginBottom: '1rem' }}>Order Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div><p className="label">Delivery Address</p><p style={{ margin: 0 }}>{order.deliveryAddress}</p></div>
                    <div><p className="label">Total Price</p><p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>${order.totalPrice.toFixed(2)}</p></div>
                    <div><p className="label">User ID</p><p style={{ margin: 0, color: 'var(--color-text-muted)' }}>#{order.userId}</p></div>
                    <div><p className="label">Driver</p><p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{order.driverId ? `#${order.driverId}` : 'Not assigned'}</p></div>
                </div>

                {/* Order Items */}
                <p className="label" style={{ marginBottom: '0.5rem' }}>Items</p>
                <table className="table">
                    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>
                        {order.orderItems.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 500 }}>{item.productName}</td>
                                <td style={{ color: 'var(--color-text-muted)' }}>{item.quantity}</td>
                                <td style={{ color: 'var(--color-text-muted)' }}>${item.priceAtOrder.toFixed(2)}</td>
                                <td style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

            {canUpdate && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p className="label">Actions</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {NEXT_STATUS[order.status] && (
                            <button className="btn btn-primary" onClick={advanceStatus} disabled={updating}>
                                Advance to: {NEXT_STATUS[order.status]?.replace(/_/g, ' ')}
                            </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button className="btn btn-danger" onClick={handleCancel} disabled={updating}>Cancel Order</button>
                        )}
                    </div>

                    {isAdmin && !order.driverId && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">Assign Driver (User ID)</label>
                                <input className="input" type="number" placeholder="Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} />
                            </div>
                            <button className="btn btn-secondary" onClick={handleAssignDriver} disabled={updating || !driverId}>Assign</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
