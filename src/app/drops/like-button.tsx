'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/toast'
import { toggleLike } from '@/lib/actions/drops'

// Affiche l'état du like et le met à jour après la réponse de l'action serveur.
export function LikeButton({ id, count: initialCount, liked: initialLiked }: { id: number; count: number; liked: boolean }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  // Demande au serveur d'ajouter ou de retirer le like du post.
  async function toggle() {
    setPending(true)
    try {
      const result = await toggleLike(id, liked)
      if ('error' in result) {
        toast.add({ type: 'error', title: 'Impossible de modifier le like', description: result.error })
        return
      }
      setLiked(result.liked)
      setCount(result.likesCount)
      toast.add({
        type: 'success',
        title: result.liked ? 'Like ajouté' : 'Like retiré',
        description: result.liked ? 'Tu as aimé ce drop.' : 'Tu as retiré ton like.',
      })
    } catch (err) {
      toast.add({
        type: 'error',
        title: 'Impossible de modifier le like',
        description: err instanceof Error ? err.message : 'Une erreur est survenue.',
      })
    } finally {
      setPending(false)
    }
  }

  return <div>
    <button onClick={toggle} disabled={pending} aria-pressed={liked} className="rounded-full border px-3 py-1.5 text-sm disabled:opacity-50">
      {pending ? '…' : liked ? '♥' : '♡'} {count}
    </button>
  </div>
}
