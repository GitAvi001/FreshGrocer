'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import type { CreateProductPayload } from '@/types';

const CATEGORIES = ['vegetables', 'fruits', 'dairy', 'meat', 'fish', 'bakery', 'general'];
const initialForm: CreateProductPayload = { name: '', description: '', price: 0, stockQuantity: 0, category: 'general', lowStockThreshold: 10, isPerishable: false, batchNumber: '' };

export default function NewProductPage() {
    const router = useRouter();
    const [form, setForm] = useState<CreateProductPayload>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k: keyof CreateProductPayload, v: unknown) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await productsApi.create(form); router.push('/products'); }
        catch (err) { setError(err instanceof Error ? err.message : 'Failed to create product'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <button onClick={() => router.push('/products')} className="btn btn-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back</button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>➕ New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Product Name *</label>
                        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="label">Description</label>
                        <input className="input" value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div>
                        <label className="label">Price ($) *</label>
                        <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
                    </div>
                    <div>
                        <label className="label">Stock Quantity *</label>
                        <input type="number" min="0" className="input" value={form.stockQuantity} onChange={e => set('stockQuantity', Number(e.target.value))} required />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select className="select" style={{ width: '100%' }} value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Low Stock Threshold</label>
                        <input type="number" min="0" className="input" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', gridColumn: '1 / -1' }}>
                        <input type="checkbox" id="perishable" checked={form.isPerishable} onChange={e => set('isPerishable', e.target.checked)} />
                        <label htmlFor="perishable">Perishable Item</label>
                    </div>
                    {form.isPerishable && (
                        <>
                            <div>
                                <label className="label">Expiration Date</label>
                                <input type="date" className="input" onChange={e => set('expirationDate', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Batch Number</label>
                                <input className="input" value={form.batchNumber} onChange={e => set('batchNumber', e.target.value)} />
                            </div>
                        </>
                    )}
                </div>

                {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => router.push('/products')}>Cancel</button>
                </div>
            </form>
        </div>
    );
}
