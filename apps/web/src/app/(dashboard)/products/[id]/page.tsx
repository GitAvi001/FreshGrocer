'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import ExpirationBadge from '@/components/ExpirationBadge';
import type { Product, UpdateProductPayload } from '@/types';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<UpdateProductPayload>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const user = typeof window !== 'undefined' ? getUser() : null;
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        productsApi.getById(Number(id)).then(p => { setProduct(p); setForm({ name: p.name, description: p.description ?? '', price: p.price, stockQuantity: p.stockQuantity, category: p.category, lowStockThreshold: p.lowStockThreshold, isPerishable: p.isPerishable, batchNumber: p.batchNumber ?? '' }); }).catch(() => router.push('/products')).finally(() => setLoading(false));
    }, [id, router]);

    const handleSave = async () => {
        setSaving(true); setError('');
        try { const updated = await productsApi.update(Number(id), form); setProduct(updated); setEditing(false); }
        catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
        finally { setSaving(false); }
    };

    if (loading || !product) return <div style={{ color: 'var(--color-text-muted)' }}>Loading product...</div>;

    return (
        <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button onClick={() => router.push('/products')} className="btn btn-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Products</button>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{product.name}</h1>
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{product.category}</p>
                </div>
                {canManage && !editing && (
                    <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Product</button>
                )}
            </div>

            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Fields */}
                {editing ? (
                    <>
                        {[['name', 'Name', 'text'], ['description', 'Description', 'text'], ['price', 'Price', 'number'], ['stockQuantity', 'Stock', 'number'], ['category', 'Category', 'text'], ['lowStockThreshold', 'Low Stock Threshold', 'number'], ['batchNumber', 'Batch Number', 'text']].map(([key, label, type]) => (
                            <div key={key}>
                                <label className="label">{label}</label>
                                <input type={type} className="input" value={(form as Record<string, unknown>)[key] as string || ''} onChange={(e) => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input type="checkbox" id="isPerishable" checked={form.isPerishable ?? false} onChange={e => setForm(f => ({ ...f, isPerishable: e.target.checked }))} />
                            <label htmlFor="isPerishable" className="label" style={{ marginBottom: 0 }}>Perishable</label>
                        </div>
                    </>
                ) : (
                    <>
                        {[['Price', `$${product.price.toFixed(2)}`], ['Stock', `${product.stockQuantity} units`], ['Low Stock At', `${product.lowStockThreshold} units`], ['Category', product.category], ['Batch', product.batchNumber || '—']].map(([label, value]) => (
                            <div key={label}>
                                <p className="label">{label}</p>
                                <p style={{ margin: 0, fontWeight: 500 }}>{value}</p>
                            </div>
                        ))}
                        {product.isPerishable && (
                            <div>
                                <p className="label">Expiration</p>
                                <ExpirationBadge status={product.expirationStatus} daysUntilExpiration={product.daysUntilExpiration} />
                                {product.expirationDate && <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(product.expirationDate).toLocaleDateString()}</p>}
                            </div>
                        )}
                    </>
                )}
            </div>

            {product.description && !editing && (
                <div className="card">
                    <p className="label">Description</p>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{product.description}</p>
                </div>
            )}

            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

            {editing && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
}
