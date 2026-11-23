'use client'

import { useEffect, useState } from 'react'
import type { Comment, CommentPage } from '@/lib/api/types'
import { retain, subscribe } from '@/lib/realtime'
import { CommentForm } from './comment-form'

// Affiche les commentaires du serveur et ajoute les nouveaux reçus par WebSocket.
export function LiveComments({ dropId, initial }: { dropId: number; initial: CommentPage }) {
  const [state, setState] = useState({ comments: initial.items, total: initial.total })
  const { comments, total } = state
  const totalPages = Math.max(1, Math.ceil(total / initial.pageSize))

  useEffect(() => {
    const stop = subscribe('comment:created', data => {
      const event = data as { comment?: Comment }
      const comment = event.comment
      if (!comment || comment.dropId !== dropId) return
      setState(current => {
        if (current.comments.some(existing => existing.id === comment.id)) return current
        return {
          comments: [...current.comments, comment].slice(-initial.pageSize),
          total: current.total + 1,
        }
      })
    })
    const release = retain()
    return () => {
      stop()
      release()
    }
  }, [dropId, initial.pageSize])

  return (
    <section id="commentaires" className="mt-8 scroll-mt-6">
      <h2 className="mb-4 text-xl font-semibold">Commentaires ({total})</h2>
      <CommentForm dropId={dropId} />
      {comments.length ? (
        <div className="space-y-3">
          {comments.map(comment => {
            const initials = comment.author.displayName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()
            return (
              <article key={comment.id} className="rounded-xl border border-white/10 bg-card/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {comment.author.avatarUrl
                        ? <img src={comment.author.avatarUrl} alt="" className="size-full object-cover" />
                        : initials || comment.author.username.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-medium">{comment.author.displayName}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(comment.createdAt))}</time>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{comment.content}</p>
              </article>
            )
          })}
        </div>
      ) : <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>}
      {totalPages > 1 && <nav className="mt-5 flex items-center justify-center gap-4" aria-label="Pages de commentaires">
        {initial.page > 1 && <a className="rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/50" href={`?commentsPage=${initial.page - 1}#commentaires`}>Précédents</a>}
        <span className="text-sm text-muted-foreground">Page {initial.page} / {totalPages}</span>
        {initial.page < totalPages && <a className="rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/50" href={`?commentsPage=${initial.page + 1}#commentaires`}>Suivants</a>}
      </nav>}
    </section>
  )
}
