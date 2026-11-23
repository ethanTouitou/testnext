'use client'

import { useEffect, useState } from 'react'
import { onOpen, retain, send, subscribe } from '@/lib/realtime'

export type PresenceUser = {
  id: number
  username: string
  displayName: string
  avatarUrl: string | null
}

// Rejoint le drop à l'ouverture et garde sa liste de lecteurs à jour.
export function usePresence(dropId: number) {
  const [viewers, setViewers] = useState<PresenceUser[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // S'abonner avant d'envoyer view, car le serveur répond immédiatement.
    const stopDrop = subscribe('presence:drop', data => {
      const presence = data as { dropId?: number; viewers?: PresenceUser[] }
      if (presence.dropId !== dropId || !Array.isArray(presence.viewers)) return
      setViewers(presence.viewers)
      setReady(true)
    })
    // Si un onglet entier se ferme, rafraîchit aussi la liste lors du changement global de présence.
    const stopOnline = subscribe('presence:online', () => {
      send('presence:view', { dropId })
    })
    const release = retain()
    const stopOpen = onOpen(() => {
      setReady(false)
      send('presence:view', { dropId })
    })

    return () => {
      stopDrop()
      stopOnline()
      stopOpen()
      send('presence:leave')
      release()
    }
  }, [dropId])

  return { viewers, ready }
}
