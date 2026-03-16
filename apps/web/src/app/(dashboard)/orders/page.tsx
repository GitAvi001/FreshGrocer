'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import type { Order } from '@/types';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const user = typeof window !== 'undefined' ? getUser() : null;
    const isAdmin = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        const fetchOrders = async () => {
            try {
                const data = isAdmin
                    ? await ordersApi.getAll()
                    : await ordersApi.getByUser(user.id);
                setOrders(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchOrders();
    }, [router, user, isAdmin]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>📦 Orders</h1>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Link href="/orders/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Place Order</Link>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Delivery Address</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 600 }}>#{order.id}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</td>
                                    <td style={{ fontWeight: 600 }}>${order.totalPrice.toFixed(2)}</td>
                                    <td style={{ color: 'var(--color-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.deliveryAddress}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }} onClick={() => router.push(`/orders/${order.id}`)}>
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
