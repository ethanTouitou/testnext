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
        <form action={action} className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-card/90 p-7 shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
            <div className="mb-8">
                <span className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Bienvenue</span>
                <h1 className="text-3xl font-bold tracking-tight">Content de te revoir</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Connecte-toi pour explorer et partager des drops.</p>
            </div>
            <div className="grid gap-5">
                <label htmlFor="login" className="grid gap-2 text-sm font-medium">
                    Identifiant
                    <input id="login" name="login" autoComplete="username" required placeholder="Ton identifiant" className="h-12 rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/10 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25" />
                </label>
                <label htmlFor="password" className="grid gap-2 text-sm font-medium">
                    Mot de passe
                    <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Ton mot de passe" className="h-12 rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/10 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25" />
                </label>
            </div>
            {state.error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{state.error}</p>}
            <button disabled={pending} className="mt-7 h-12 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-60">
                {pending ? 'Connexion…' : 'Se connecter'}
            </button>
        </form>
    )
}   
