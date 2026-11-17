import { apiGet } from '@/lib/api/client'
import type { Category, DropPage } from '@/lib/api/types'
import { Categories } from './categories'
import { SearchBox } from './search-box'
import { LikeButton } from './like-button'

type Props = { searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }> }

export default async function DropsPage({ searchParams }: Props) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category) query.set('category', params.category)
  query.set('sort', params.sort === 'popular' ? 'popular' : 'recent')
  query.set('page', params.page ?? '1')
  query.set('pageSize', '20')
  const [result, categories] = await Promise.all([
    apiGet<DropPage>(`/drops?${query}`),
    apiGet<Category[]>('/categories'),
  ])

  return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
    <h1 className="mb-2 text-3xl font-bold">Les drops</h1>
    <p className="mb-7 text-zinc-600">Découvre les messages et recommandations de la communauté.</p>
    <div className="mb-5"><SearchBox query={params.q} /></div>
    <Categories categories={categories} selected={params.category} query={params.q} sort={params.sort} />
    <form className="my-6 flex items-center gap-3">
      <label htmlFor="sort" className="text-sm text-zinc-600">Trier par</label>
      <select id="sort" name="sort" defaultValue={params.sort === 'popular' ? 'popular' : 'recent'} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
        <option value="recent">Plus récents</option><option value="popular">Plus aimés</option>
      </select>
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {params.category && <input type="hidden" name="category" value={params.category} />}
      <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">Appliquer</button>
    </form>
    <p className="mb-4 text-sm text-zinc-500">{result.total} drop{result.total === 1 ? '' : 's'}</p>
    {result.items.length ? <div className="grid gap-4 sm:grid-cols-2">
      {result.items.map(drop => <article key={drop.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs capitalize">{categories.find(c => c.id === drop.category)?.label ?? drop.category}</span><time className="text-xs text-zinc-500">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(drop.createdAt))}</time></div>
        <h2 className="mb-2 text-lg font-semibold">{drop.title}</h2>
        {drop.content && <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{drop.content}</p>}
        {drop.imageUrl && <img src={drop.imageUrl} alt="" className="mt-4 max-h-72 w-full rounded-lg object-cover" />}
        <div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm text-zinc-500">Par {drop.author.displayName}</span><LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} /></div>
      </article>)}
    </div> : <p className="rounded-xl border border-dashed p-10 text-center text-zinc-500">Aucun drop ne correspond à ta recherche.</p>}
    {result.totalPages > 1 && <nav className="mt-8 flex justify-center gap-4" aria-label="Pagination">
      {result.page > 1 && <a className="rounded-md border px-4 py-2" href={`?${new URLSearchParams(Object.entries({ ...params, page: String(result.page - 1) }).filter((entry): entry is [string, string] => entry[1] !== undefined))}`}>Précédent</a>}
      <span className="py-2 text-sm">Page {result.page} / {result.totalPages}</span>
      {result.page < result.totalPages && <a className="rounded-md border px-4 py-2" href={`?${new URLSearchParams(Object.entries({ ...params, page: String(result.page + 1) }).filter((entry): entry is [string, string] => entry[1] !== undefined))}`}>Suivant</a>}
    </nav>}
  </main>
}
