'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { retain, subscribe } from '@/lib/realtime'

// Recharge les données serveur quand un drop est créé ou supprimé en direct.
export function RealtimeDropRefresh() {
  const router = useRouter()

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined
    const refresh = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => router.refresh(), 100)
    }
    const stopCreated = subscribe('drop:created', refresh)
    const stopDeleted = subscribe('drop:deleted', refresh)
    const release = retain()

    return () => {
      stopCreated()
      stopDeleted()
      clearTimeout(refreshTimer)
      release()
    }
  }, [router])

  return null
}
