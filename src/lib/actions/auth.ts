'use server'
import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';
import { apiPost } from '@/lib/api/client';
import type { AuthResponse } from '@/lib/api/types';

export async function login(prev: { error?: string }, from: FormData) {
    const res = await apiPost('/auth/login', {
        login: from.get('login'),
        password: from.get('password'),
    });
    if (!res.ok) return { error: 'Identifiants invalides' };
    const { token } = (await res.json()) as AuthResponse;
    await setSession(token);
    redirect('/');
}