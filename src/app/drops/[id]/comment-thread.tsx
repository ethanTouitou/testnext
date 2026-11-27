'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Comment } from '@/lib/api/types'
import { createComment, deleteComment, getCommentReplies } from '@/lib/actions/drops'
import { retain, subscribe } from '@/lib/realtime'
import { ReactionButtons } from '@/components/reaction-buttons'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

function CommentAuthor({ comment }: { comment: Comment }) {
  const initials = comment.author.displayName.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('').toUpperCase()
  const content = <>
    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary">
      {comment.author.avatarUrl
        ? <Image src={comment.author.avatarUrl} alt="" width={32} height={32} unoptimized loading="lazy" className="size-full object-cover" />
        : initials || comment.author.username.slice(0, 2).toUpperCase()}
    </span>
    <span className="truncate text-sm font-medium">{comment.deleted ? 'Utilisateur supprimé' : comment.author.displayName}</span>
  </>

  return comment.deleted || comment.author.username === 'deleted'
    ? <span className="flex min-w-0 items-center gap-2 text-muted-foreground">{content}</span>
    : <Link href={`/profile/${encodeURIComponent(comment.author.username)}`} className="flex min-w-0 items-center gap-2 rounded-md hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{content}</Link>
}

function DeleteCommentButton({ commentId }: { commentId: number }) {
  const [state, setState] = useState<{ error?: string; success?: string }>({})
  const [pending, setPending] = useState(false)
  const router = useRouter()
  async function action() {
    setPending(true)
    try {
      const result = await deleteComment(commentId)
      setState(result)
      if (result.success) router.refresh()
    } catch {
      setState({ error: 'Impossible de supprimer ce commentaire. Réessaie.' })
    } finally {
      setPending(false)
    }
  }

  return <div>
    <button type="button" onClick={() => {
      if (!pending && window.confirm('Supprimer ce commentaire ?')) void action()
    }} disabled={pending || Boolean(state.success)} className="text-xs text-muted-foreground transition hover:text-destructive disabled:opacity-50">{pending ? 'Suppression…' : 'Supprimer'}</button>
    {state.error && <span role="alert" className="ml-2 text-xs text-destructive">{state.error}</span>}
  </div>
}

function ReplyForm({ dropId, parentId, onCancel }: { dropId: number; parentId: number; onCancel: () => void }) {
  const actionWithId = createComment.bind(null, dropId)
  const [state, action, pending] = useActionState(actionWithId, {})

  return <form action={action} className="mt-3 grid gap-2 rounded-xl border border-border bg-background/50 p-3">
    <input type="hidden" name="parentId" value={parentId} />
    <label htmlFor={`reply-${parentId}`} className="text-xs font-medium">Ta réponse</label>
    <textarea id={`reply-${parentId}`} name="content" required maxLength={500} placeholder="Écris ta réponse…" className="min-h-16 w-full rounded-lg border border-input px-3 py-2 text-sm" />
    {state.error && <p role="alert" className="text-xs text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-xs text-green-700">{state.success}</p>}
    <div className="flex gap-2">
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50">{pending ? 'Envoi…' : 'Répondre'}</button>
      <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs">Annuler</button>
    </div>
  </form>
}

function Replies({ comment }: { comment: Comment }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<{ items: Comment[]; page: number; pageSize: number; total: number; totalPages: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [replying, setReplying] = useState(false)

  async function loadPage(nextPage: number) {
    setLoading(true)
    setError('')
    const result = await getCommentReplies(comment.id, nextPage)
    if ('error' in result) setError(result.error)
    else setPage(result)
    setLoading(false)
  }

  useEffect(() => {
    if (!open) return
    const stop = subscribe('comment:created', data => {
      const event = data as { comment?: Comment }
      const reply = event.comment
      if (!reply || reply.parentId !== comment.id) return
      setPage(current => {
        if (!current || current.items.some(item => item.id === reply.id)) return current
        const total = current.total + 1
        const totalPages = Math.max(1, Math.ceil(total / current.pageSize))
        const items = current.page === totalPages ? [...current.items, reply].slice(-current.pageSize) : current.items
        return { ...current, items, total, totalPages }
      })
    })
    const release = retain()
    return () => { stop(); release() }
  }, [comment.id, open])

  const replyCount = page?.total ?? comment.repliesCount
  return <div className="mt-3 border-l-2 border-border pl-3 sm:pl-4">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button type="button" onClick={() => {
        const next = !open
        setOpen(next)
        if (next && !page && !loading) void loadPage(1)
      }} className="text-xs font-medium text-primary hover:underline">
        {open ? 'Masquer les réponses' : `Voir les réponses (${replyCount})`}
      </button>
      {!comment.deleted && <button type="button" onClick={() => {
        setReplying(value => !value)
        if (!open && !page && !loading) void loadPage(1)
        setOpen(true)
      }} className="text-xs text-muted-foreground hover:text-foreground">Répondre</button>}
    </div>
    {replying && <ReplyForm dropId={comment.dropId} parentId={comment.id} onCancel={() => setReplying(false)} />}
    {open && <div className="mt-3 space-y-3">
      {loading && <p role="status" className="text-xs text-muted-foreground">Chargement des réponses…</p>}
      {error && <div className="flex items-center gap-3 text-xs"><p role="alert" className="text-destructive">{error}</p><button type="button" onClick={() => void loadPage(page?.page ?? 1)} className="underline">Réessayer</button></div>}
      {page?.items.map(reply => <CommentRow key={reply.id} comment={reply} />)}
      {page && page.items.length === 0 && <p className="text-xs text-muted-foreground">Aucune réponse pour le moment.</p>}
      {page && page.totalPages > 1 && <div className="flex items-center justify-center gap-3 text-xs">
        <button type="button" disabled={page.page <= 1 || loading} onClick={() => void loadPage(page.page - 1)} className="underline disabled:opacity-50">Précédentes</button>
        <span>Page {page.page} / {page.totalPages}</span>
        <button type="button" disabled={page.page >= page.totalPages || loading} onClick={() => void loadPage(page.page + 1)} className="underline disabled:opacity-50">Suivantes</button>
      </div>}
    </div>}
  </div>
}

function CommentRow({ comment }: { comment: Comment }) {
  return <article className="rounded-xl border border-white/10 bg-card/70 p-4">
    <div className="mb-2 flex items-center justify-between gap-3">
      <CommentAuthor comment={comment} />
      <time className="shrink-0 text-xs text-muted-foreground">{dateFormat.format(new Date(comment.createdAt))}</time>
    </div>
    <p className={`whitespace-pre-wrap text-sm leading-6 ${comment.deleted ? 'italic text-muted-foreground' : 'text-foreground/90'}`}>
      {comment.deleted ? 'Ce commentaire a été supprimé.' : comment.content}
    </p>
    {!comment.deleted && <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <ReactionButtons id={comment.id} subject="comment" likesCount={comment.likesCount} dislikesCount={comment.dislikesCount} liked={comment.likedByMe} disliked={comment.dislikedByMe} compact />
      {comment.isMine && <DeleteCommentButton commentId={comment.id} />}
    </div>}
  </article>
}

export function CommentThread({ comment }: { comment: Comment }) {
  return <div>
    <CommentRow comment={comment} />
    {comment.parentId === null && <Replies comment={comment} />}
  </div>
}
