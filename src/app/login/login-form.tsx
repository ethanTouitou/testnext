'use client'
import { useActionState } from 'react'
import { login } from '@/lib/actions/auth'
import type { LoginState } from '@/lib/actions/auth'

// État initial du formulaire, sans message d'erreur.
const initialState: LoginState = {}

// Relie le formulaire à l'action serveur de connexion et affiche son résultat.
export function LoginForm() {
    const [state, action, pending] = useActionState(login, initialState)

    return (
        <form action={action}>
            <input name="login" autoComplete="username" required />
            <input name="password" type="password" autoComplete="current-password" required />
            {state.error && <p role="alert">{state.error}</p>}
            <button disabled={pending}>Se connecter</button>
        </form>
    )
}   
