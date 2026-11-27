'use client'

import { useEffect, useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { ReactionKind } from '@/lib/actions/drops'
import { toggleCommentReaction, toggleDropReaction } from '@/lib/actions/drops'
import type { LikeState } from '@/lib/api/types'
import { toast } from '@/components/ui/toast'
import { retain, subscribe } from '@/lib/realtime'

type Props = {
  id: number
  subject: 'drop' | 'comment'
  likesCount: number
  dislikesCount: number
  liked: boolean
  disliked: boolean
  compact?: boolean
}

// Réactions exclusives : l'API retire automatiquement l'autre réaction quand on bascule.
export function ReactionButtons({ id, subject, likesCount: initialLikes, dislikesCount: initialDislikes, liked: initialLiked, disliked: initialDisliked, compact = false }: Props) {
  const [counts, setCounts] = useState({ likes: initialLikes, dislikes: initialDislikes })
  const [selection, setSelection] = useState<ReactionKind | null>(initialLiked ? 'like' : initialDisliked ? 'dislike' : null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (subject === 'drop') {
      const stop = subscribe('like:updated', data => {
        const update = data as { dropId?: number; likesCount?: number; dislikesCount?: number }
        if (update.dropId !== id) return
        setCounts(current => ({
          likes: typeof update.likesCount === 'number' ? update.likesCount : current.likes,
          dislikes: typeof update.dislikesCount === 'number' ? update.dislikesCount : current.dislikes,
        }))
      })
      const release = retain()
      return () => { stop(); release() }
    }

    const stop = subscribe('comment:updated', data => {
      const update = data as { comment?: { id: number; likesCount: number; dislikesCount: number; likedByMe: boolean; dislikedByMe: boolean } }
      if (update.comment?.id !== id) return
      setCounts({ likes: update.comment.likesCount, dislikes: update.comment.dislikesCount })
      setSelection(update.comment.likedByMe ? 'like' : update.comment.dislikedByMe ? 'dislike' : null)
    })
    const release = retain()
    return () => { stop(); release() }
  }, [id, subject])

  async function react(target: ReactionKind) {
    if (pending) return
    setPending(true)
    try {
      const result = subject === 'drop'
        ? await toggleDropReaction(id, selection, target)
        : await toggleCommentReaction(id, selection, target)
      if ('error' in result) {
        toast.add({ type: 'error', title: 'Réaction impossible', description: result.error })
        return
      }
      const state = result as LikeState
      setCounts({ likes: state.likesCount, dislikes: state.dislikesCount })
      setSelection(state.liked ? 'like' : state.disliked ? 'dislike' : null)
    } catch (error) {
      toast.add({ type: 'error', title: 'Réaction impossible', description: error instanceof Error ? error.message : 'Une erreur est survenue.' })
    } finally {
      setPending(false)
    }
  }

  const buttonClass = (active: boolean) => `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-50 ${active ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`

  return <div className={`flex items-center gap-2 ${compact ? 'text-xs' : ''}`} aria-label="Réactions">
    <button type="button" onClick={() => react('like')} disabled={pending} aria-pressed={selection === 'like'} aria-label={selection === 'like' ? 'Retirer le like' : 'Aimer'} className={buttonClass(selection === 'like')}>
      <ThumbsUp aria-hidden="true" className="size-4" /> <span>{counts.likes}</span>
    </button>
    <button type="button" onClick={() => react('dislike')} disabled={pending} aria-pressed={selection === 'dislike'} aria-label={selection === 'dislike' ? 'Retirer le dislike' : 'Ne pas aimer'} className={buttonClass(selection === 'dislike')}>
      <ThumbsDown aria-hidden="true" className="size-4" /> <span>{counts.dislikes}</span>
    </button>
  </div>
}
