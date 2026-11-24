'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { retain, subscribe } from '@/lib/realtime'
import type { PresenceUser } from '@/hooks/use-presence'

type PresenceMessage = { users?: PresenceUser[] }
type HelloMessage = { online?: PresenceUser[] }

// Affiche dans la navigation les comptes actuellement connectés.
export function OnlinePresence() {
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stopHello = subscribe('hello', data => {
      const hello = data as HelloMessage
      if (!Array.isArray(hello.online)) return
      setUsers(hello.online)
      setReady(true)
    })
    const stopOnline = subscribe('presence:online', data => {
      const presence = data as PresenceMessage
      if (!Array.isArray(presence.users)) return
      setUsers(presence.users)
      setReady(true)
    })
    const release = retain()

    return () => {
      stopHello()
      stopOnline()
      release()
    }
  }, [])

  return (
    <div role="group" aria-label={ready ? `${users.length} personnes en ligne` : 'Présence en chargement'} className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map(user => {
          const initials = user.displayName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()

          return (
            <span key={user.id} title={user.displayName} className="flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-primary/20 text-[10px] font-semibold text-primary">
              {user.avatarUrl
                ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized loading="lazy" className="size-full object-cover" />
                : initials || user.username.slice(0, 2).toUpperCase()}
            </span>
          )
        })}
      </div>
      <span className="size-2 rounded-full bg-emerald-400 sm:hidden" title={ready ? `${users.length} en ligne` : 'En ligne…'} />
      <span className="hidden text-xs text-muted-foreground sm:block">
        {ready ? `${users.length} en ligne` : 'En ligne…'}
      </span>
    </div>
  )
}
