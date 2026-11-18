import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { apiGet, ApiError } from '@/lib/api/client'
import { getSession } from '@/lib/session'
import type { Category, Drop } from '@/lib/api/types'
import { LikeButton } from '../like-button'

type Props = { params: Promise<{ id: string }> }

export default function DropPage(props: Props) {
  return <Suspense fallback={<main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">Chargement du drop…</main>}>
    <DropDetails {...props} />
  </Suspense>
}

async function DropDetails({ params }: Props) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()

  const token = await getSession()
  const [drop, categories] = await Promise.all([
      apiGet<Drop>(`/drops/${id}`, token),
      apiGet<Category[]>('/categories', token),
  ]).catch(error => {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  })
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
      {drop.locked && !drop.openedByMe ? (
        <p className="rounded-lg bg-zinc-100 p-4 text-zinc-600">Ce drop est verrouillé.</p>
      ) : (
        <>
          {drop.content && <p className="whitespace-pre-wrap leading-7 text-zinc-700">{drop.content}</p>}
          {drop.imageUrl && <img src={drop.imageUrl} alt="" className="mt-5 max-h-[32rem] w-full rounded-lg object-cover" />}
        </>
      )}
      <div className="mt-6 flex items-center justify-between border-t pt-5">
        <span className="text-sm text-zinc-500">{drop.commentsCount} commentaire{drop.commentsCount === 1 ? '' : 's'}</span>
        <LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} />
      </div>
    </article>
  </main>
}
