'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi, ordersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import type { PaginatedProducts, Order } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, expiring: 0, totalOrders: 0, pendingOrders: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const user = typeof window !== 'undefined' ? getUser() : null;

    useEffect(() => {
        if (!user) { router.push('/login'); return; }

        const load = async () => {
            try {
                const [productsData, lowStockData, expiringData, ordersData] = await Promise.all([
                    productsApi.getAll(1, 1) as Promise<PaginatedProducts>,
                    productsApi.getLowStock(),
                    productsApi.getExpiring(3),
                    ordersApi.getAll(),
                ]);
                setStats({
                    totalProducts: productsData.total,
                    lowStock: lowStockData.length,
                    expiring: expiringData.length,
                    totalOrders: ordersData.length,
                    pendingOrders: ordersData.filter(o => o.status === 'pending').length,
                });
                setRecentOrders(ordersData.slice(0, 5));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [router, user]);

    if (loading) return <div style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Loading dashboard...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    Welcome back, <span style={{ color: 'var(--color-primary)', textTransform: 'capitalize' }}>{user?.role}</span> 👋
                </h1>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>Here&apos;s what&apos;s happening in your store today.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.totalProducts}</span>
                    <span className="stat-label">Total Products</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: stats.lowStock > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>{stats.lowStock}</span>
                    <span className="stat-label">Low Stock Items</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: stats.expiring > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>{stats.expiring}</span>
                    <span className="stat-label">Expiring (3 days)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.totalOrders}</span>
                    <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value" style={{ color: stats.pendingOrders > 0 ? 'var(--color-warning)' : 'var(--color-primary)' }}>{stats.pendingOrders}</span>
                    <span className="stat-label">Pending Orders</span>
                </div>
            </div>

            {/* Alerts */}
            {(stats.lowStock > 0 || stats.expiring > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stats.lowStock > 0 && (
                        <div style={{ padding: '1rem 1.25rem', background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>⚠️ <strong>{stats.lowStock} product{stats.lowStock > 1 ? 's' : ''}</strong> are below their low-stock threshold.</span>
                            <Link href="/admin/low-stock" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}>View</Link>
                        </div>
                    )}
                    {stats.expiring > 0 && (
                        <div style={{ padding: '1rem 1.25rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>⏰ <strong>{stats.expiring} perishable item{stats.expiring > 1 ? 's' : ''}</strong> are expiring within 3 days.</span>
                            <Link href="/admin/expiring" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}>View</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Orders */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Orders</h2>
                    <Link href="/orders" style={{ color: 'var(--color-accent)', fontSize: '0.875rem', textDecoration: 'none' }}>View all →</Link>
                </div>
                {recentOrders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders yet.</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Order #</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/orders/${order.id}`)}>
                                    <td style={{ fontWeight: 600 }}>#{order.id}</td>
                                    <td><span className={`badge badge-${order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : order.status === 'pending' ? 'yellow' : 'blue'}`}>{order.status}</span></td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
