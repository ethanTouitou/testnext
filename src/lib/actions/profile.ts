'use server'

import { revalidatePath } from 'next/cache'
import { apiPatch } from '@/lib/api/client'
import { getSession } from '@/lib/session'

export type AvatarState = { error?: string; success?: string }

// Valide l'adresse de l'image puis enregistre l'avatar sur le profil connecté.
export async function updateAvatar(_state: AvatarState, formData: FormData): Promise<AvatarState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour modifier ton avatar.' }

  const value = formData.get('avatarUrl')
  if (typeof value !== 'string') return { error: 'Renseigne une adresse d’image valide.' }

  const avatarUrl = value.trim()
  if (avatarUrl.length > 2048) return { error: 'L’adresse de l’image est trop longue.' }
  if (avatarUrl) {
    try {
      const url = new URL(avatarUrl)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('URL invalide')
    } catch {
      return { error: 'Utilise une adresse d’image commençant par https:// ou http://.' }
    }
  }

  try {
    const response = await apiPatch('/auth/me', { avatarUrl: avatarUrl || null }, token)
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null
      return {
        error: response.status === 401
          ? 'Ta session a expiré. Reconnecte-toi.'
          : body?.error?.message ?? 'Impossible de modifier ton avatar.',
      }
    }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath('/profile')
  revalidatePath('/drops')
  return { success: avatarUrl ? 'Avatar mis à jour.' : 'Avatar supprimé.' }
}
