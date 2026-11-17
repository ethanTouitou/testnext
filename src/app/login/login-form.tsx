'use client'
import { useActionState } from '@/lib/actions/client'
import { login } from '@/lib/actions/auth'

export function LoginForm() {
    const [state, action, pending] = useActionState(login, {})

    return (
        <form action={action}>
            <input name="login" required />
            <input name="password" type="password" required />
            {state.error && <p role="alert">{state.error}</p>}
            <button disabled={pending}>Se connecter</button>
        </form>
    )
}   
