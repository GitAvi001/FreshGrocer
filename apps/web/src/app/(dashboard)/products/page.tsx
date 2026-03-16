'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import ExpirationBadge from '@/components/ExpirationBadge';
import type { PaginatedProducts, Product } from '@/types';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'dairy', 'meat', 'fish', 'bakery', 'general'];

export default function ProductsPage() {
    const router = useRouter();
    const [data, setData] = useState<PaginatedProducts | null>(null);
    const [searchResults, setSearchResults] = useState<Product[] | null>(null);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const user = typeof window !== 'undefined' ? getUser() : null;
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const loadProducts = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await productsApi.getAll(p, 12);
            setData(res);
            setSearchResults(null);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadProducts(page); }, [page, loadProducts]);

    const handleSearch = async () => {
        if (!query.trim() && category === 'all') { loadProducts(1); return; }
        setLoading(true);
        try {
            const res = await productsApi.search(query, category !== 'all' ? category : undefined);
            setSearchResults(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        try { await productsApi.delete(id); loadProducts(page); } catch (e) { alert(e instanceof Error ? e.message : 'Error'); }
    };

    const products = searchResults ?? data?.products ?? [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>🛒 Products</h1>
                {canManage && (
                    <Link href="/products/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Add Product</Link>
                )}
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.5rem' }}>
                <input className="input" placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, minWidth: '180px' }} />
                <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                {searchResults !== null && <button className="btn btn-secondary" onClick={() => { setQuery(''); setCategory('all'); loadProducts(1); }}>Clear</button>}
            </div>

            {/* Product Grid */}
            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>Loading products...</div>
            ) : products.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>No products found.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {products.map(product => (
                        <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/products/${product.id}`)}>
                            {product.isLowStock && (
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                    <span className="badge badge-yellow">⚠️ Low Stock</span>
                                </div>
                            )}
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{product.category}</p>
                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.05rem', fontWeight: 600 }}>{product.name}</h3>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>${product.price.toFixed(2)}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{product.stockQuantity} in stock</span>
                            </div>
                            {product.isPerishable && <ExpirationBadge status={product.expirationStatus} daysUntilExpiration={product.daysUntilExpiration} />}
                            {canManage && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
                                    <Link href={`/products/${product.id}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.8rem' }}>Edit</Link>
                                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => handleDelete(product.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!searchResults && data && data.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Page {page} of {data.totalPages}</span>
                    <button className="btn btn-secondary" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}
        </div>
    );
}
