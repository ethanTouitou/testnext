'use client'

import { useActionState, useState } from 'react'
import { updateAvatar } from '@/lib/actions/profile'
import type { AvatarState } from '@/lib/actions/profile'

const initialState: AvatarState = {}

// Montre un aperçu de l'image et enregistre son URL sur le compte.
export function AvatarForm({ displayName, username, avatarUrl: initialAvatarUrl }: {
  displayName: string
  username: string
  avatarUrl: string | null
}) {
  const [state, action, pending] = useActionState(updateAvatar, initialState)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '')
  const [imageError, setImageError] = useState(false)
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/15 text-2xl font-semibold text-primary">
        {avatarUrl && !imageError
          ? <img src={avatarUrl} alt={`Aperçu de l’avatar de ${displayName}`} onError={() => setImageError(true)} className="size-full object-cover" />
          : initials || username.slice(0, 2).toUpperCase()}
      </div>
      <div className="grid gap-2">
        <label htmlFor="avatarUrl" className="text-sm font-medium">Adresse web de l’avatar</label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={event => {
            setAvatarUrl(event.target.value)
            setImageError(false)
          }}
          placeholder="https://exemple.com/mon-avatar.jpg"
          className="h-12 rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
        <p className="text-xs text-muted-foreground">Colle le lien d’une image. Laisse le champ vide pour supprimer l’avatar.</p>
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300 sm:col-span-2">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300 sm:col-span-2">{state.success}</p>}
      <button disabled={pending} className="w-fit rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
        {pending ? 'Enregistrement…' : 'Enregistrer l’avatar'}
      </button>
    </form>
  )
}
