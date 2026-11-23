import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiGet, ApiError } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { Category, CommentPage, Drop } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { PresenceWidget } from '@/components/presence-widget'
import { LiveCommentCount } from '@/components/live-comment-count'
import { LiveComments } from './live-comments'
import { LikeButton } from '../like-button'
import { EditDropForm } from './edit-drop-form'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ commentsPage?: string }>
}

// Affiche un état de chargement pendant la récupération du post et de ses commentaires.
export default function DropPage(props: Props) {
  return <Suspense fallback={<main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 text-muted-foreground">Chargement du drop…</main>}>
    <DropDetails {...props} />
  </Suspense>
}

// Charge le post, sa catégorie et ses commentaires à partir de son identifiant.
async function DropDetails({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!/^\d+$/.test(id)) notFound()

  const requestedPage = Number(query.commentsPage ?? 0)
  const commentsPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const token = await getSession()
  const commentsQuery = new URLSearchParams({ page: String(commentsPage), pageSize: '20' })
  const [drop, categories] = await Promise.all([
    apiGet<Drop>(`/drops/${id}`, token),
    apiGet<Category[]>('/categories', token),
  ]).catch(error => {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  })
  let comments = await apiGet<CommentPage>(`/drops/${id}/comments?${commentsQuery}`, token)
  if (!query.commentsPage && comments.totalPages > 1) {
    const lastPage = new URLSearchParams({ page: String(comments.totalPages), pageSize: '20' })
    comments = await apiGet<CommentPage>(`/drops/${id}/comments?${lastPage}`, token)
  }
  const category = categories.find(item => item.id === drop.category)?.label ?? drop.category

  return <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
    <Link href="/drops" className="text-sm text-muted-foreground transition hover:text-primary">← Retour aux drops</Link>
    <article className="mt-5 rounded-2xl border border-white/10 bg-card/80 p-6 shadow-xl shadow-black/15 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge>{category}</Badge>
        <time className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(drop.createdAt))}
        </time>
      </div>
      <h1 className="mb-3 text-3xl font-bold">{drop.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">Par {drop.author.displayName}</p>
      <PresenceWidget key={drop.id} dropId={drop.id} />
      {drop.isMine && <EditDropForm drop={drop} />}
      {drop.locked && !drop.openedByMe ? (
        <p className="rounded-xl border border-border bg-muted p-4 text-muted-foreground">Ce drop est verrouillé.</p>
      ) : (
        <>
          {drop.content && <p className="whitespace-pre-wrap leading-7 text-foreground/90">{drop.content}</p>}
          {drop.imageUrl && <img src={drop.imageUrl} alt="" className="mt-5 h-full w-full rounded-lg object-cover" />}
        </>
      )}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <a href="#commentaires" className="text-sm text-muted-foreground transition hover:text-primary">
          <LiveCommentCount key={drop.id} dropId={drop.id} initialCount={drop.commentsCount} knownIds={comments.items.map(comment => comment.id)} />
        </a>
        <LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} />
      </div>
    </article>
    <LiveComments key={`${comments.page}:${comments.total}:${comments.items.map(comment => comment.id).join(',')}`} dropId={drop.id} initial={comments} />
  </main>
}
