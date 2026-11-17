'use client'

import { useState } from 'react'

export function LikeButton({ id, count: initialCount, liked: initialLiked }: { id: number; count: number; liked: boolean }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function toggle() {
    const token = localStorage.getItem('token')
    if (!token) return setError('Connecte-toi pour aimer un drop.')

    setPending(true)
    setError('')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drops/${id}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Impossible de modifier le like. Réessaie.')
      const result: { liked: boolean; likesCount: number } = await response.json()
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
