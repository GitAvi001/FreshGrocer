'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            saveAuth(res.access_token, res.user);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'radial-gradient(ellipse at top, #0f2a1a 0%, var(--color-bg) 50%)',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🥦</div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>FreshGrocer</h1>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(248, 81, 73, 0.1)',
                            border: '1px solid rgba(248, 81, 73, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--color-danger)',
                            fontSize: '0.875rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        No account?{' '}
                        <Link href="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
