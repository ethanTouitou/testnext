'use server'

import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { CommentPage, LikeState } from '@/lib/api/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type DeleteDropState = { error?: string; success?: string }
export type CreateDropState = { error?: string; success?: string }
export type CreateCommentState = { error?: string; success?: string }
export type UpdateDropState = { error?: string }
export type CommentActionState = { error?: string; success?: string }
export type ReactionKind = 'like' | 'dislike'

async function getApiError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as { error?: { message?: string; fields?: Record<string, string[]> } } | null
  const fields = Object.entries(body?.error?.fields ?? {})
    .flatMap(([field, messages]) => messages.map(message => `${field} : ${message}`))
  return [body?.error?.message, ...fields].filter(Boolean).join(' ') || fallback
}

// Vérifie les champs puis envoie les changements du post à l'API.
export async function updateDrop(id: number, _state: UpdateDropState, formData: FormData): Promise<UpdateDropState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour modifier un drop.' }

  const title = formData.get('title')
  const content = formData.get('content')
  const category = formData.get('category')
  const imageUrl = formData.get('imageUrl')
  const latValue = formData.get('lat')
  const lngValue = formData.get('lng')
  const lat = typeof latValue === 'string' && latValue.trim() ? Number(latValue) : Number.NaN
  const lng = typeof lngValue === 'string' && lngValue.trim() ? Number(lngValue) : Number.NaN
  const validCategories = ['note', 'photo', 'tip', 'riddle']

  if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    return { error: 'Le titre et le contenu sont obligatoires.' }
  }
  if (title.trim().length < 3 || title.trim().length > 80) return { error: 'Le titre doit contenir entre 3 et 80 caractères.' }
  if (content.trim().length > 1000) return { error: 'Le contenu ne peut pas dépasser 1000 caractères.' }
  if (typeof category !== 'string' || !validCategories.includes(category)) {
    return { error: 'Choisis une catégorie valide.' }
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: 'Choisis une latitude et une longitude valides sur la carte.' }
  }
  if (category === 'photo' && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    return { error: 'Ajoute l’URL de la photo pour cette catégorie.' }
  }
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 500) return { error: 'L’URL de l’image ne peut pas dépasser 500 caractères.' }

  try {
    const res = await apiPatch(`/drops/${id}`, {
      title: title.trim(),
      content: content.trim(),
      category,
      imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null,
      lat,
      lng,
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
  const parentIdValue = formData.get('parentId')
  const parentId = typeof parentIdValue === 'string' && parentIdValue.trim() ? Number(parentIdValue) : undefined
  if (typeof content !== 'string' || !content.trim()) return { error: 'Écris un commentaire avant de l’envoyer.' }
  if (content.trim().length > 500) return { error: 'Le commentaire ne peut pas dépasser 500 caractères.' }
  if (parentId !== undefined && (!Number.isSafeInteger(parentId) || parentId <= 0)) return { error: 'La réponse ne cible pas un commentaire valide.' }

  try {
    const res = await apiPost(`/drops/${id}/comments`, { content: content.trim(), ...(parentId ? { parentId } : {}) }, token)
    if (!res.ok) {
      return { error: await getApiError(res, 'Impossible d’envoyer le commentaire.') }
    }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath(`/drops/${id}`)
  return { success: 'Commentaire envoyé.' }
}

// Charge les réponses via le serveur afin que le jeton de session reste httpOnly.
export async function getCommentReplies(id: number, page = 1): Promise<CommentPage | { error: string }> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour lire les réponses.' }
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(page) || page <= 0) {
    return { error: 'La page de réponses demandée est invalide.' }
  }

  try {
    const query = new URLSearchParams({ page: String(page), pageSize: '20' })
    return await apiGet<CommentPage>(`/comments/${id}/replies?${query}`, token)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Impossible de charger les réponses.' }
  }
}

// Supprime un commentaire appartenant à l'utilisateur, avec conservation des fils de réponses côté API.
export async function deleteComment(id: number): Promise<CommentActionState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour supprimer ce commentaire.' }
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Ce commentaire est invalide.' }

  try {
    const response = await apiDelete(`/comments/${id}`, token)
    if (!response.ok) return { error: await getApiError(response, 'Impossible de supprimer le commentaire.') }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  revalidatePath('/drops')
  return { success: 'Commentaire supprimé.' }
}

// Supprime un post avec le token de session et actualise les pages concernées.
export async function deleteDrop(id: number, _state: DeleteDropState, _formData: FormData): Promise<DeleteDropState> {
  void _state
  void _formData
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour supprimer un drop.' }

  try {
    const res = await apiDelete(`/drops/${id}`, token)
    if (!res.ok) return { error: await getApiError(res, 'Impossible de supprimer le drop.') }

    revalidatePath('/drops')
    revalidatePath(`/drops/${id}`)
    return { success: 'Drop supprimé.' }
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
  if (title.trim().length < 3 || title.trim().length > 80) return { error: 'Le titre doit contenir entre 3 et 80 caractères.' }
  if (content.trim().length > 1000) return { error: 'Le contenu ne peut pas dépasser 1000 caractères.' }
  if (typeof category !== 'string' || !categories.includes(category as typeof categories[number])) {
    return { error: 'Choisis une catégorie valide.' }
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: 'Choisis une latitude et une longitude valides sur la carte.' }
  }
  if (category === 'photo' && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    return { error: 'Ajoute l’URL de la photo pour cette catégorie.' }
  }
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 500) return { error: 'L’URL de l’image ne peut pas dépasser 500 caractères.' }

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


// Les routes like et dislike sont exclusives : l'API retire la réaction opposée automatiquement.
async function toggleReaction(path: string, selected: ReactionKind | null, target: ReactionKind, token: string) {
  const response = selected === target
    ? await apiDelete(`${path}/${target}`, token)
    : await apiPost(`${path}/${target}`, {}, token)

  if (!response.ok) return { error: await getApiError(response, 'Impossible de modifier la réaction.') }
  return await response.json() as LikeState
}

export async function toggleDropReaction(id: number, selected: ReactionKind | null, target: ReactionKind): Promise<LikeState | { error: string }> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour réagir à ce drop.' }
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Ce drop est invalide.' }

  try {
    return await toggleReaction(`/drops/${id}`, selected, target, token)
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }
}

export async function toggleCommentReaction(id: number, selected: ReactionKind | null, target: ReactionKind): Promise<LikeState | { error: string }> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour réagir à un commentaire.' }
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Ce commentaire est invalide.' }

  try {
    return await toggleReaction(`/comments/${id}`, selected, target, token)
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }
}

export async function reportDrop(id: number, _state: CommentActionState, formData: FormData): Promise<CommentActionState> {
  const token = await getSession()
  if (!token) return { error: 'Connecte-toi pour signaler ce drop.' }
  if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Ce drop est invalide.' }

  const reason = formData.get('reason')
  const details = formData.get('details')
  const allowedReasons = ['spam', 'offensive', 'personal_info', 'other']
  if (typeof reason !== 'string' || !allowedReasons.includes(reason)) return { error: 'Choisis un motif de signalement.' }
  if (typeof details === 'string' && details.trim().length > 300) return { error: 'Le détail ne peut pas dépasser 300 caractères.' }

  try {
    const response = await apiPost(`/drops/${id}/report`, {
      reason,
      ...(typeof details === 'string' && details.trim() ? { details: details.trim() } : {}),
    }, token)
    if (!response.ok) return { error: await getApiError(response, 'Impossible de signaler ce drop.') }
  } catch {
    return { error: 'Le serveur ne répond pas. Réessaie plus tard.' }
  }

  return { success: 'Signalement envoyé. Merci de nous aider à garder la communauté sûre.' }
}
