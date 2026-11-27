'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Comment, CommentPage } from '@/lib/api/types'
import { retain, subscribe } from '@/lib/realtime'
import { CommentForm } from './comment-form'
import { CommentThread } from './comment-thread'

// Affiche les commentaires du serveur et ajoute les nouveaux reçus par WebSocket.
export function LiveComments({ dropId, initial }: { dropId: number; initial: CommentPage }) {
  const [state, setState] = useState({ comments: initial.items, total: initial.total, page: initial.page })
  const { comments, total, page } = state
  const totalPages = Math.max(1, Math.ceil(total / initial.pageSize))
  const router = useRouter()
  const seenEventIds = useRef(new Set(initial.items.map(comment => comment.id)))

  useEffect(() => {
    const stop = subscribe('comment:created', data => {
      const event = data as { comment?: Comment }
      const comment = event.comment
      if (!comment || comment.dropId !== dropId) return
      if (seenEventIds.current.has(comment.id)) return
      seenEventIds.current.add(comment.id)
      if (comment.parentId !== null) {
        setState(current => ({
          ...current,
          comments: current.comments.map(root => root.id === comment.parentId
            ? { ...root, repliesCount: root.repliesCount + 1 }
            : root),
        }))
        return
      }
      setState(current => {
        if (current.comments.some(existing => existing.id === comment.id)) return current
        const total = current.total + 1
        const totalPages = Math.max(1, Math.ceil(total / initial.pageSize))
        const wasOnLastPage = current.page >= Math.max(1, Math.ceil(current.total / initial.pageSize))
        return {
          comments: wasOnLastPage ? [...current.comments, comment].slice(-initial.pageSize) : current.comments,
          total,
          page: wasOnLastPage ? totalPages : current.page,
        }
      })
    })
    const stopDelete = subscribe('comment:deleted', data => {
      const event = data as { dropId?: number }
      if (event.dropId === dropId) router.refresh()
    })
    const release = retain()
    return () => {
      stop()
      stopDelete()
      release()
    }
  }, [dropId, initial.pageSize, router])

  return (
    <section id="commentaires" className="mt-8 scroll-mt-6">
      <h2 className="mb-4 text-xl font-semibold">Commentaires ({total})</h2>
      <CommentForm dropId={dropId} />
      {comments.length ? (
        <div className="space-y-3">
          {comments.map(comment => <CommentThread key={comment.id} comment={comment} />)}
        </div>
      ) : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>}
      {totalPages > 1 && <nav className="mt-5 flex items-center justify-center gap-4" aria-label="Pages de commentaires">
        {page > 1 && <a className="rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/50" href={`?commentsPage=${page - 1}#commentaires`}>Précédents</a>}
        <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
        {page < totalPages && <a className="rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/50" href={`?commentsPage=${page + 1}#commentaires`}>Suivants</a>}
      </nav>}
    </section>
  )
}
