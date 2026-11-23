'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { onAuthExpired, retain, subscribe } from '@/lib/realtime'

type NotificationEvent = {
  kind?: 'drop_opened' | 'drop_liked' | 'drop_commented' | string
  dropId?: number
  dropTitle?: string
  by?: string | { displayName?: string; username?: string }
}

// Reçoit les notifications personnelles sans créer une deuxième socket.
export function RealtimeNotifications() {
  const router = useRouter()

  useEffect(() => {
    const stop = subscribe('notification', data => {
      const event = data as NotificationEvent
      const sender = typeof event.by === 'string'
        ? event.by
        : event.by?.displayName ?? event.by?.username ?? 'Quelqu’un'
      const title = event.kind === 'drop_opened'
        ? 'Ton drop a été découvert'
        : event.kind === 'drop_liked'
          ? 'Ton drop a reçu un like'
          : 'Nouveau commentaire sur ton drop'
      const description = `${sender} · ${event.dropTitle ?? 'Un de tes drops'}`

      toast(title, {
        description,
        ...(event.dropId ? {
          action: {
            label: 'Voir',
            onClick: () => router.push(`/drops/${event.dropId}`),
          },
        } : {}),
      })
    })
    const stopAuth = onAuthExpired(() => router.push('/login'))
    const release = retain()

    return () => {
      stop()
      stopAuth()
      release()
    }
  }, [router])

  return null
}
