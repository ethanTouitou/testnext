'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';
import { apiPost } from '@/lib/api/client';
import type { AuthResponse } from '@/lib/api/types';

export type LoginState = { error?: string };

export async function login(_prev: LoginState, from: FormData): Promise<LoginState> {
    const login = from.get('login');
    const password = from.get('password');
    if (typeof login !== 'string' || typeof password !== 'string' || !login || !password) {
        return { error: 'Renseigne ton identifiant et ton mot de passe.' };
    }

    let token: string;
    try {
        const res = await apiPost('/auth/login', { login, password });
        if (res.status === 401) return { error: 'Identifiant ou mot de passe incorrect.' };
        if (!res.ok) return { error: 'La connexion a échoué. Réessaie plus tard.' };
        ({ token } = (await res.json()) as AuthResponse);
    } catch {
        return { error: 'Impossible de joindre le serveur. Réessaie plus tard.' };
    }

    await setSession(token);
    redirect('/');
}

export async function logout() {
    (await cookies()).delete('session')
    redirect('/login')
}
