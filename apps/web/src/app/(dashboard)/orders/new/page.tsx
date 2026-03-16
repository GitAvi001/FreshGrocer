'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, ordersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import type { Product } from '@/types';

interface CartItem { productId: number; productName: string; price: number; quantity: number; }

export default function NewOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const user = typeof window !== 'undefined' ? getUser() : null;

    useEffect(() => {
        productsApi.getAll(1, 50).then(r => setProducts(r.products.filter(p => p.stockQuantity > 0 && p.expirationStatus !== 'expired' && p.expirationStatus !== 'critical'))).finally(() => setLoading(false));
    }, []);

    const addToCart = (p: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === p.id);
            if (existing) return prev.map(i => i.productId === p.id ? { ...i, quantity: Math.min(i.quantity + 1, p.stockQuantity) } : i);
            return [...prev, { productId: p.id, productName: p.name, price: p.price, quantity: 1 }];
        });
    };

    const updateQty = (productId: number, qty: number) => {
        if (qty <= 0) setCart(prev => prev.filter(i => i.productId !== productId));
        else setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    };

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const handleSubmit = async () => {
        if (!user) return;
        if (cart.length === 0) { setError('Add at least one item to your cart.'); return; }
        if (!address.trim()) { setError('Please enter a delivery address.'); return; }
        setError(''); setSubmitting(true);
        try {
            const order = await ordersApi.create({ userId: user.id, deliveryAddress: address, items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })) });
            router.push(`/orders/${order.id}`);
        } catch (e) { setError(e instanceof Error ? e.message : 'Order failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <button onClick={() => router.push('/orders')} className="btn btn-secondary" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back</button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>🛍️ Place New Order</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Products */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Select Products</h2>
                    {loading ? (
                        <div style={{ color: 'var(--color-text-muted)' }}>Loading products...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                            {products.map(p => {
                                const inCart = cart.find(i => i.productId === p.id);
                                return (
                                    <div key={p.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{p.category}</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>${p.price.toFixed(2)}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.stockQuantity} left</span>
                                        </div>
                                        {inCart ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '1rem' }} onClick={() => updateQty(p.id, inCart.quantity - 1)}>−</button>
                                                <span style={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>{inCart.quantity}</span>
                                                <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '1rem' }} onClick={() => updateQty(p.id, inCart.quantity + 1)} disabled={inCart.quantity >= p.stockQuantity}>+</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => addToCart(p)}>Add to Cart</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Cart & Checkout */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>🛒 Cart</h2>
                    {cart.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No items added yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map(item => (
                                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{item.productName}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>x{item.quantity} × ${item.price.toFixed(2)}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                                        <button onClick={() => updateQty(item.productId, 0)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                <span>Total</span><span style={{ color: 'var(--color-primary)' }}>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label">Delivery Address</label>
                        <input className="input" placeholder="123 Main St, City" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>

                    {error && <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</div>}

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} onClick={handleSubmit} disabled={submitting || cart.length === 0}>
                        {submitting ? 'Placing order...' : `Place Order — $${total.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
