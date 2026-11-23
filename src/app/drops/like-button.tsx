'use client'

import { useState } from 'react'
import { toggleLike } from '@/lib/actions/drops'

// Affiche l'état du like et le met à jour après la réponse de l'action serveur.
export function LikeButton({ id, count: initialCount, liked: initialLiked }: { id: number; count: number; liked: boolean }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // Demande au serveur d'ajouter ou de retirer le like du post.
  async function toggle() {
    setPending(true)
    setError('')
    try {
      const result = await toggleLike(id, liked)
      if ('error' in result) return setError(result.error)
      setLiked(result.liked)
      setCount(result.likesCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setPending(false)
    }
  }

  return <div>
    <button onClick={toggle} disabled={pending} aria-pressed={liked} className="rounded-full border px-3 py-1.5 text-sm disabled:opacity-50">
      {pending ? '…' : liked ? '♥' : '♡'} {count}
    </button>
    {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
}
