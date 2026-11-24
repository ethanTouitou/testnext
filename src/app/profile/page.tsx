import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApiError, apiGet } from '@/lib/api/client'
import type { PrivateUser } from '@/lib/api/types'
import { requireSession } from '@/lib/session'
import { AvatarForm } from './avatar-form'

// Charge le profil privé pour permettre à l'utilisateur de modifier son avatar.
export default async function ProfilePage() {
  const token = await requireSession()
  const profile = await apiGet<PrivateUser>('/auth/me', token).catch(error => {
    if (error instanceof ApiError && error.status === 401) redirect('/login')
    throw error
  })

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <Link href="/drops" className="text-sm text-muted-foreground transition hover:text-primary">← Retour aux drops</Link>
      <section className="mt-5 rounded-2xl border border-white/10 bg-card/80 p-6 shadow-xl shadow-black/15 sm:p-8">
        <span className="text-sm font-medium text-primary">Mon compte</span>
        <h1 className="mt-2 text-3xl font-bold">Mon profil</h1>
        <p className="mt-2 text-muted-foreground">Personnalise l’image qui apparaît à côté de ton nom.</p>
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-4 text-sm text-muted-foreground">{profile.displayName} · @{profile.username}</p>
          <AvatarForm displayName={profile.displayName} username={profile.username} avatarUrl={profile.avatarUrl} />
        </div>
      </section>
    </main>
  )
}
