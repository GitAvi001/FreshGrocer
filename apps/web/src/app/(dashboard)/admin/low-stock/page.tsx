'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';

export default function LowStockPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productsApi.getLowStock().then(setProducts).finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>⚠️ Low Stock Alerts</h1>
                <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-muted)' }}>Products at or below their reorder threshold.</p>
            </div>

            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : products.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-primary)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                    <p style={{ margin: 0, fontWeight: 600 }}>All products are well-stocked!</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', background: 'rgba(210,153,34,0.08)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{products.length} product{products.length !== 1 ? 's' : ''} need restocking</span>
                    </div>
                    <table className="table">
                        <thead>
                            <tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Threshold</th><th>Deficit</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{p.category}</td>
                                    <td>
                                        <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>{p.stockQuantity}</span>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}> units</span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{p.lowStockThreshold} units</td>
                                    <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>−{p.lowStockThreshold - p.stockQuantity}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }} onClick={() => router.push(`/products/${p.id}`)}>
                                            Update Stock
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
}
