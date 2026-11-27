import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { apiGet, ApiError } from '@/lib/api/client'
import { requireSession } from '@/lib/session'
import { getCategories } from '@/lib/data/categories'
import type { CommentPage, Drop } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'
import { PresenceWidget } from '@/components/presence-widget'
import { DropsMap } from '@/components/map/drops-map'
import { LiveCommentCount } from '@/components/live-comment-count'
import { LiveComments } from './live-comments'
import { ReactionButtons } from '@/components/reaction-buttons'
import { EditDropForm } from './edit-drop-form'
import { DeleteDropButton, ReportDropForm } from '../drop-forms'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ commentsPage?: string }>
}
const dropDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

// Le fichier loading.tsx affiche le squelette pendant la récupération du post.
export default function DropPage(props: Props) {
  return <DropDetails {...props} />
}

// Charge le post, sa catégorie et ses commentaires à partir de son identifiant.
async function DropDetails({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!/^\d+$/.test(id)) notFound()

  const requestedPage = Number(query.commentsPage ?? 0)
  const commentsPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const token = await requireSession()
  const commentsQuery = new URLSearchParams({ page: String(commentsPage), pageSize: '20' })
  const [drop, categories, firstComments] = await Promise.all([
    apiGet<Drop>(`/drops/${id}`, token),
    getCategories(token),
    apiGet<CommentPage>(`/drops/${id}/comments?${commentsQuery}`, token),
  ]).catch(error => {
    if (error instanceof ApiError && error.status === 401) redirect('/login')
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  })
  let comments = firstComments
  if (!query.commentsPage && comments.totalPages > 1) {
    const lastPage = new URLSearchParams({ page: String(comments.totalPages), pageSize: '20' })
    comments = await apiGet<CommentPage>(`/drops/${id}/comments?${lastPage}`, token).catch(error => {
      if (error instanceof ApiError && error.status === 401) redirect('/login')
      if (error instanceof ApiError && error.status === 404) notFound()
      throw error
    })
  }
  const category = categories.find(item => item.id === drop.category)?.label ?? drop.category

  return <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
    <Link href="/drops" className="text-sm text-muted-foreground transition hover:text-primary">← Retour aux drops</Link>
    <article className="mt-5 rounded-2xl border border-white/10 bg-card/80 p-6 shadow-xl shadow-black/15 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge>{category}</Badge>
        <time className="text-sm text-muted-foreground">
          {dropDate.format(new Date(drop.createdAt))}
        </time>
      </div>
      <h1 className="mb-3 text-3xl font-bold">{drop.title}</h1>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Par{' '}
          <Link href={`/profile/${encodeURIComponent(drop.author.username)}`} className="font-medium text-foreground transition hover:text-primary hover:underline">
            {drop.author.displayName}
          </Link>
        </p>
        {drop.isMine && <details className="group rounded-xl border border-border bg-background/40 p-3">
          <summary className="cursor-pointer text-sm font-medium text-primary">Gérer mon drop</summary>
          <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <EditDropForm drop={drop} />
            <DeleteDropButton id={drop.id} />
          </div>
        </details>}
      </div>
      <PresenceWidget key={drop.id} dropId={drop.id} />
      {drop.content && <p className="whitespace-pre-wrap leading-7 text-foreground/90">{drop.content}</p>}
      {drop.imageUrl && <Image src={drop.imageUrl} alt="" width={1200} height={800} unoptimized loading="lazy" sizes="(max-width: 768px) 100vw, 720px" className="mt-5 h-auto max-h-[70vh] w-full rounded-lg object-cover" />}
      <section className="mt-6" aria-labelledby="drop-location-title">
        <h2 id="drop-location-title" className="mb-3 text-lg font-semibold">Position du drop</h2>
        <div className="h-72 overflow-hidden rounded-2xl border border-white/10">
          <DropsMap drops={[drop]} activeId={drop.id} />
        </div>
      </section>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <a href="#commentaires" className="text-sm text-muted-foreground transition hover:text-primary">
          <LiveCommentCount key={drop.id} dropId={drop.id} initialCount={drop.commentsCount} knownIds={comments.items.map(comment => comment.id)} />
        </a>
        <ReactionButtons id={drop.id} subject="drop" likesCount={drop.likesCount} dislikesCount={drop.dislikesCount} liked={drop.likedByMe} disliked={drop.dislikedByMe} />
      </div>
      {!drop.isMine && <ReportDropForm id={drop.id} />}
    </article>
    <LiveComments key={`${comments.page}:${comments.total}:${comments.items.map(comment => `${comment.id}:${comment.deleted}:${comment.repliesCount}`).join(',')}`} dropId={drop.id} initial={comments} />
  </main>
}
