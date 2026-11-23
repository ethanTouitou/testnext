import { LoginForm } from './login-form';

// Affiche le formulaire de connexion sur la route /login.
export default function LoginPage() {
    return (
        <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16">
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <LoginForm />
        </main>
    )
}
