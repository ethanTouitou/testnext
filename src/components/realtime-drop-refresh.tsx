'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { retain, subscribe } from '@/lib/realtime'

// Recharge les données serveur quand un drop est créé ou supprimé en direct.
export function RealtimeDropRefresh() {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => router.refresh()
    const stopCreated = subscribe('drop:created', refresh)
    const stopDeleted = subscribe('drop:deleted', refresh)
    const release = retain()

    return () => {
      stopCreated()
      stopDeleted()
      release()
    }
  }, [router])

  return null
}
