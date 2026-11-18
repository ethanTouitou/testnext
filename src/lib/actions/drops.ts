'use server'

import { apiDelete, apiPost } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { LikeState } from '@/lib/api/types'

export async function toggleLike(id: number, liked: boolean): Promise<LikeState | { error: string }> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour aimer un drop.' }

  try {
    const response = liked
      ? await apiDelete(`/drops/${id}/like`, token)
      : await apiPost(`/drops/${id}/like`, {}, token)

    if (!response.ok) {
      return { error: response.status === 401 ? 'Ta session a expiré. Reconnecte-toi.' : 'Impossible de modifier le like.' }
    }

    return await response.json() as LikeState
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }
}
