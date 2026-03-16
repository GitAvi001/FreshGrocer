'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import ExpirationBadge from '@/components/ExpirationBadge';
import type { Product } from '@/types';

export default function ExpiringPage() {
    const router = useRouter();
    const [expiring, setExpiring] = useState<Product[]>([]);
    const [expired, setExpired] = useState<Product[]>([]);
    const [days, setDays] = useState(3);
    const [loading, setLoading] = useState(true);

    const load = (d: number) => {
        setLoading(true);
        Promise.all([productsApi.getExpiring(d), productsApi.getExpired()])
            .then(([exp, expd]) => { setExpiring(exp); setExpired(expd); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(days); }, [days]);

    const TableSection = ({ title, items, emptyMsg }: { title: string; items: Product[]; emptyMsg: string }) => (
        <div>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', fontWeight: 600 }}>{title}</h2>
            {items.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--color-primary)', padding: '1.5rem' }}>{emptyMsg}</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table">
                        <thead>
                            <tr><th>Product</th><th>Category</th><th>Batch</th><th>Expiration Date</th><th>Status</th><th>Stock</th><th></th></tr>
                        </thead>
                        <tbody>
                            {items.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{p.category}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{p.batchNumber || '—'}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : '—'}</td>
                                    <td><ExpirationBadge status={p.expirationStatus} daysUntilExpiration={p.daysUntilExpiration} /></td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{p.stockQuantity}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }} onClick={() => router.push(`/products/${p.id}`)}>
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>⏰ Expiring Items</h1>
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-muted)' }}>Monitor perishable product freshness.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="label" style={{ marginBottom: 0 }}>Alert window:</label>
                    <select className="select" value={days} onChange={e => setDays(Number(e.target.value))}>
                        {[1, 2, 3, 5, 7].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : (
                <>
                    <TableSection
                        title={`🟡 Expiring within ${days} day${days > 1 ? 's' : ''} (${expiring.length})`}
                        items={expiring}
                        emptyMsg={`✅ No items expiring within ${days} days`}
                    />
                    <TableSection
                        title={`⛔ Already Expired (${expired.length})`}
                        items={expired}
                        emptyMsg="✅ No expired products"
                    />
                </>
            )}
        </div>
    );
}
