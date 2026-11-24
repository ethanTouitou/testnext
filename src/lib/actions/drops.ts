'use server'

import { apiDelete, apiPatch, apiPost } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { LikeState } from '@/lib/api/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type DeleteDropState = { error?: string }
export type CreateDropState = { error?: string; success?: string }
export type CreateCommentState = { error?: string; success?: string }
export type UpdateDropState = { error?: string }

// Vérifie les champs puis envoie les changements du post à l'API.
export async function updateDrop(id: number, _state: UpdateDropState, formData: FormData): Promise<UpdateDropState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour modifier un drop.' }

  const title = formData.get('title')
  const content = formData.get('content')
  const category = formData.get('category')
  const imageUrl = formData.get('imageUrl')
  const validCategories = ['note', 'photo', 'tip', 'riddle']

  if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    return { error: 'Le titre et le contenu sont obligatoires.' }
  }
  if (typeof category !== 'string' || !validCategories.includes(category)) {
    return { error: 'Choisis une catégorie valide.' }
  }
  if (category === 'photo' && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    return { error: 'Ajoute l’URL de la photo pour cette catégorie.' }
  }

  try {
    const res = await apiPatch(`/drops/${id}`, {
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null,
    }, token)

    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: { message?: string; fields?: Record<string, string[]> } } | null
      const apiError = body?.error
      const fields = Object.entries(apiError?.fields ?? []).flatMap(([field, messages]) => messages.map(message => `${field} : ${message}`))
      return { error: [apiError?.message, ...fields].filter(Boolean).join(' ') || 'Impossible de modifier le drop.' }
    }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath('/drops')
  revalidatePath(`/drops/${id}`)
  redirect(`/drops/${id}`)
}

// Envoie un nouveau commentaire puis actualise la page du post.
export async function createComment(id: number, _state: CreateCommentState, formData: FormData): Promise<CreateCommentState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour commenter.' }

  const content = formData.get('content')
  if (typeof content !== 'string' || !content.trim()) return { error: 'Écris un commentaire avant de l’envoyer.' }
  if (content.trim().length > 500) return { error: 'Le commentaire ne peut pas dépasser 500 caractères.' }

  try {
    const res = await apiPost(`/drops/${id}/comments`, { content: content.trim() }, token)
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: { message?: string } } | null
      return { error: body?.error?.message ?? 'Impossible d’envoyer le commentaire.' }
    }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath(`/drops/${id}`)
  return { success: 'Commentaire envoyé.' }
}

// Supprime un post avec le token de session et actualise les pages concernées.
export async function deleteDrop(id: number, _state: DeleteDropState, _formData: FormData): Promise<DeleteDropState> {
  void _state
  void _formData
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour supprimer un drop.' }

  try {
    const res = await apiDelete(`/drops/${id}`, token)
    if (!res.ok) return { error: 'Impossible de supprimer le drop.' }

    revalidatePath('/drops')
    revalidatePath(`/drops/${id}`)
    return {}
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }
}

// Valide les champs du formulaire et crée un post auprès de l'API.
export async function createDrop(_state: CreateDropState, formData: FormData): Promise<CreateDropState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour créer un drop.' }

  const title = formData.get('title')
  const content = formData.get('content')
  const category = formData.get('category')
  const imageUrl = formData.get('imageUrl')
  const latValue = formData.get('lat')
  const lngValue = formData.get('lng')
  const lat = typeof latValue === 'string' && latValue.trim() ? Number(latValue) : Number.NaN
  const lng = typeof lngValue === 'string' && lngValue.trim() ? Number(lngValue) : Number.NaN
  const categories = ['note', 'photo', 'tip', 'riddle'] as const

  if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    return { error: 'Le titre et le contenu sont obligatoires.' }
  }
  if (typeof category !== 'string' || !categories.includes(category as typeof categories[number])) {
    return { error: 'Choisis une catégorie valide.' }
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'Renseigne une latitude et une longitude valides.' }
  if (category === 'photo' && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    return { error: 'Ajoute l’URL de la photo pour cette catégorie.' }
  }

  try {
    const res = await apiPost('/drops', {
      title: title.trim(),
      content: content.trim(),
      category,
      ...(typeof imageUrl === 'string' && imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      lat,
      lng,
    }, token)

    if (!res.ok) {
      const body = await res.json().catch(() => null) as {
        error?: { message?: string; fields?: Record<string, string[]> }
      } | null
      const apiError = body?.error
      const fieldErrors = Object.entries(apiError?.fields ?? {})
        .flatMap(([field, messages]) => messages.map(message => `${field} : ${message}`))
      return { error: [apiError?.message, ...fieldErrors].filter(Boolean).join(' ') || 'Impossible de créer le drop.' }
    }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath('/drops')
  return { success: 'Drop créé.' }
}


// Ajoute ou retire le like, selon l'état actuel du bouton.
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
