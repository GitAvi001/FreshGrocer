import type {
    AuthResponse,
    CreateOrderPayload,
    CreateProductPayload,
    Order,
    PaginatedProducts,
    Product,
    UpdateProductPayload,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fg_token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `Request failed: ${res.status}`);
    }

    // Handle empty body (e.g. DELETE responses)
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
    login: (email: string, password: string) =>
        apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (email: string, password: string, role?: string) =>
        apiFetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        }),
};

// ─── Products ────────────────────────────────────────────────────────────────

export const productsApi = {
    getAll: (page = 1, limit = 12) =>
        apiFetch<PaginatedProducts>(`/products?page=${page}&limit=${limit}`),

    getById: (id: number) => apiFetch<Product>(`/products/${id}`),

    search: (query: string, category?: string) =>
        apiFetch<Product[]>(
            `/products/search?query=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`
        ),

    getLowStock: () => apiFetch<Product[]>('/products/low-stock'),

    getExpiring: (days = 3) => apiFetch<Product[]>(`/products/expiring?days=${days}`),

    getExpired: () => apiFetch<Product[]>('/products/expired'),

    create: (payload: CreateProductPayload) =>
        apiFetch<Product>('/products', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: number, payload: UpdateProductPayload) =>
        apiFetch<Product>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),

    updateStock: (id: number, stockQuantity: number) =>
        apiFetch<Product>(`/products/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ stockQuantity }),
        }),

    delete: (id: number) =>
        apiFetch<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const ordersApi = {
    getAll: () => apiFetch<Order[]>('/orders'),

    getById: (id: number) => apiFetch<Order>(`/orders/${id}`),

    getByUser: (userId: number) => apiFetch<Order[]>(`/orders/user/${userId}`),

    create: (payload: CreateOrderPayload) =>
        apiFetch<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    updateStatus: (id: number, status: string) =>
        apiFetch<Order>(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),

    assignDriver: (id: number, driverId: number) =>
        apiFetch<Order>(`/orders/${id}/driver`, {
            method: 'PATCH',
            body: JSON.stringify({ driverId }),
        }),

    cancel: (id: number) =>
        apiFetch<{ message: string }>(`/orders/${id}`, { method: 'DELETE' }),
};
