import 'server-only';

export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiGet<T>(path: string, token?: string) {
    const baseUrl = process.env.API_URL;
    if (!baseUrl) throw new Error('La variable API_URL est manquante.');

    let res: Response;
    try {
        res = await fetch(`${baseUrl}${path}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    } catch {
        throw new Error("Impossible de joindre le serveur. Vérifie ta connexion et réessaie.");
    }

    if (res.status === 401) {
        throw new ApiError('Non autorisé. Vérifie que tu es bien connecté.', res.status);
    }
    if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new ApiError(body?.error?.message ?? `Le serveur a répondu avec l’erreur ${res.status}.`, res.status);
    }

    try {
        return (await res.json()) as T;
    } catch {
        throw new Error("Le serveur a renvoyé une réponse invalide.");
    }
}

export async function apiPost<T>(path: string, data: T, token?: string) {
    const baseUrl = process.env.API_URL;
    if (!baseUrl) throw new Error('La variable API_URL est manquante.');

    return fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
}

export async function apiDelete(path: string, token: string) {
    const baseUrl = process.env.API_URL;
    if (!baseUrl) throw new Error('La variable API_URL est manquante.');

    return fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
}
