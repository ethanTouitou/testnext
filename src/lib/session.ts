import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSession() {
    return (await cookies()).get('session')?.value;
}

export async function setSession(token: string) {
    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function requireSession() {
    const token = (await cookies()).get('session')?.value;
    if (!token) redirect('/login');
    return token;
}


