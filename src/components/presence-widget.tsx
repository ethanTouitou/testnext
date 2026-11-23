'use client'

import { usePresence } from '@/hooks/use-presence'

// Affiche les avatars et les initiales des personnes sur le même drop.
export function PresenceWidget({ dropId }: { dropId: number }) {
  const { viewers, ready } = usePresence(dropId)
  const visibleViewers = viewers.slice(0, 5)

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
      <div role="group" aria-label={`${viewers.length} personne(s) sur ce drop`} className="flex shrink-0 -space-x-2">
        {visibleViewers.map(user => {
          const initials = user.displayName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()

          return (
            <span key={user.id} title={user.displayName} className="flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-primary/20 text-xs font-semibold text-primary">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                : initials || user.username.slice(0, 2).toUpperCase()}
            </span>
          )
        })}
        {viewers.length > visibleViewers.length && (
          <span className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
            +{viewers.length - visibleViewers.length}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {!ready
            ? 'Connexion à la présence…'
            : viewers.length === 0
              ? 'Personne ne regarde ce drop pour le moment'
              : viewers.length === 1
              ? 'Tu es le seul à regarder ce drop'
              : `${viewers.length} personnes regardent ce drop`}
        </p>
        <p className="text-xs text-muted-foreground">Présence en direct</p>
      </div>
    </div>
  )
}
