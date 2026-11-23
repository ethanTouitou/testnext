import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Lit le token stocké dans le cookie HTTP-only de la session.
export async function getSession() {
    return (await cookies()).get('session')?.value;
}

// Enregistre le token en cookie inaccessible au JavaScript du navigateur.
export async function setSession(token: string) {
    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

// Renvoie le token ou redirige vers la page de connexion s'il manque.
export async function requireSession() {
    const token = (await cookies()).get('session')?.value;
    if (!token) redirect('/login');
    return token;
}
