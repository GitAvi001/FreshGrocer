'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getUser } from '@/lib/auth';
import type { AuthUser } from '@/types';

interface NavItem {
    href: string;
    label: string;
    icon: string;
    roles?: string[];
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/products', label: 'Products', icon: '🛒' },
    { href: '/orders', label: 'Orders', icon: '📦' },
    { href: '/orders/new', label: 'Place Order', icon: '➕', roles: ['admin', 'manager'] },
    { href: '/admin/low-stock', label: 'Low Stock', icon: '⚠️', roles: ['admin', 'manager'] },
    { href: '/admin/expiring', label: 'Expiring Items', icon: '⏰', roles: ['admin', 'manager'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const u = getUser();
        if (!u) {
            router.push('/login');
        } else {
            setUser(u);
        }
    }, [router]);

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const visibleItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role))
    );

    return (
        <aside style={{
            width: '240px',
            minHeight: '100vh',
            background: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 0',
            position: 'sticky',
            top: 0,
        }}>
            {/* Logo */}
            <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>🥦</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                        FreshGrocer
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                                background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User info + logout */}
            {user && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                            {user.role}
                        </p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
}
