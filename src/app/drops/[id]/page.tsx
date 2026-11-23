import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { apiGet, ApiError } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { Category, CommentPage, Drop } from '@/lib/api/types'
import { LikeButton } from '../like-button'
import { CommentForm } from './comment-form'
import { EditDropForm } from './edit-drop-form'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ commentsPage?: string }>
}

// Affiche un état de chargement pendant la récupération du post et de ses commentaires.
export default function DropPage(props: Props) {
  return <Suspense fallback={<main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">Chargement du drop…</main>}>
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
    <a href="/drops" className="text-sm text-zinc-600 hover:text-zinc-900">← Retour aux drops</a>
    <article className="mt-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm">{category}</span>
        <time className="text-sm text-zinc-500">
          {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(drop.createdAt))}
        </time>
      </div>
      <h1 className="mb-3 text-3xl font-bold">{drop.title}</h1>
      <p className="mb-6 text-sm text-zinc-500">Par {drop.author.displayName}</p>
      {drop.isMine && <EditDropForm drop={drop} />}
      {drop.locked && !drop.openedByMe ? (
        <p className="rounded-lg bg-zinc-100 p-4 text-zinc-600">Ce drop est verrouillé.</p>
      ) : (
        <>
          {drop.content && <p className="whitespace-pre-wrap leading-7 text-zinc-700">{drop.content}</p>}
          {drop.imageUrl && <img src={drop.imageUrl} alt="" className="mt-5 h-full w-full rounded-lg object-cover" />}
        </>
      )}
      <div className="mt-6 flex items-center justify-between border-t pt-5">
        <a href="#commentaires" className="text-sm text-zinc-500 hover:underline">{drop.commentsCount} commentaire{drop.commentsCount === 1 ? '' : 's'}</a>
        <LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} />
      </div>
    </article>
    <section id="commentaires" className="mt-8 scroll-mt-6">
      <h2 className="mb-4 text-xl font-semibold">Commentaires ({comments.total})</h2>
      <CommentForm dropId={drop.id} />
      {comments.items.length ? <div className="space-y-3">
        {comments.items.map(comment => <article key={comment.id} className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{comment.author.displayName}</span>
            <time className="text-xs text-zinc-500">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(comment.createdAt))}</time>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{comment.content}</p>
        </article>)}
      </div> : <p className="rounded-lg border border-dashed p-5 text-sm text-zinc-500">Aucun commentaire pour le moment.</p>}
      {comments.totalPages > 1 && <nav className="mt-5 flex items-center justify-center gap-4" aria-label="Pages de commentaires">
        {comments.page > 1 && <a className="rounded-md border px-3 py-2 text-sm" href={`?commentsPage=${comments.page - 1}#commentaires`}>Précédents</a>}
        <span className="text-sm text-zinc-500">Page {comments.page} / {comments.totalPages}</span>
        {comments.page < comments.totalPages && <a className="rounded-md border px-3 py-2 text-sm" href={`?commentsPage=${comments.page + 1}#commentaires`}>Suivants</a>}
      </nav>}
    </section>
  </main>
}
