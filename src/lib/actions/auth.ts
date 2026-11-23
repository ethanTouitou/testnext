'use server'
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
        if (!res.ok) return { error: 'Identifiant ou mot de passe incorrect.' };
        ({ token } = (await res.json()) as AuthResponse);
    } catch {
        return { error: 'Impossible de joindre le serveur. Réessaie plus tard.' };
    }

    await setSession(token);
    redirect('/');
}
