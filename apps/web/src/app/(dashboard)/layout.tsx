import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem', overflow: 'auto', maxWidth: 'calc(100vw - 240px)' }}>
                {children}
            </main>
        </div>
    );
}
