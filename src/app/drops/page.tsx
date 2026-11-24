import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ApiError, apiGet } from '@/lib/api/client'
import { requireSession } from '@/lib/session'
import { getCategories } from '@/lib/data/categories'
import { logout } from '@/lib/actions/auth'
import type { DropPage } from '@/lib/api/types'
import { Categories } from './categories'
import { SearchBox } from './search-box'
import { LikeButton } from './like-button'
import { CreateDropForm, DeleteDropButton } from './drop-forms'
import { RealtimeDropRefresh } from '@/components/realtime-drop-refresh'
import { LiveCommentCount } from '@/components/live-comment-count'

type Props = { searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }> }
const dropDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

// Le fichier loading.tsx affiche le squelette pendant le chargement serveur.
export default function DropsPage(props: Props) {
  return <DropsContent {...props} />
}

// Lit les filtres de l'URL, récupère les drops et affiche la liste paginée.
async function DropsContent({ searchParams }: Props) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category) query.set('category', params.category)
  query.set('sort', params.sort === 'popular' ? 'popular' : 'recent')
  query.set('page', params.page ?? '1')
  query.set('pageSize', '20')
  const token = await requireSession()
  const [result, categories] = await Promise.all([
    apiGet<DropPage>(`/drops?${query}`, token),
    getCategories(token),
  ]).catch(error => {
    if (error instanceof ApiError && error.status === 401) redirect('/login')
    throw error
  })

  return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
    <RealtimeDropRefresh />
    <header className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Les drops</h1>
        <p className="text-muted-foreground">Découvre les messages et recommandations de la communauté.</p>
      </div>
      <form action={logout}>
        <button className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground">Se déconnecter</button>
      </form>
    </header>
    <div className="mb-5"><SearchBox query={params.q} /></div>
    <CreateDropForm />
    <Categories categories={categories} selected={params.category} query={params.q} sort={params.sort} />
    <form className="my-6 flex items-center gap-3">
      <label htmlFor="sort" className="text-sm text-muted-foreground">Trier par</label>
      <select id="sort" name="sort" defaultValue={params.sort === 'popular' ? 'popular' : 'recent'} className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
        <option value="recent">Plus récents</option><option value="popular">Plus aimés</option>
      </select>
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {params.category && <input type="hidden" name="category" value={params.category} />}
      <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">Appliquer</button>
    </form>
    <p className="mb-4 text-sm text-muted-foreground">{result.total} drop{result.total === 1 ? '' : 's'}</p>
    {result.items.length ? <div className="grid gap-4 sm:grid-cols-2">
      {result.items.map(drop => <article key={drop.id} className="rounded-2xl border border-white/10 bg-card/80 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-primary/30">
        <div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-primary/15 px-3 py-1 text-xs capitalize text-primary">{categories.find(c => c.id === drop.category)?.label ?? drop.category}</span><time className="text-xs text-muted-foreground">{dropDate.format(new Date(drop.createdAt))}</time></div>
        <h2 className="mb-2 text-lg font-semibold"><Link href={`/drops/${drop.id}`} className="transition hover:text-primary">{drop.title}</Link></h2>
        {drop.content && <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{drop.content}</p>}
        {drop.imageUrl && <Image src={drop.imageUrl} alt="" width={1200} height={800} unoptimized loading="lazy" sizes="(max-width: 640px) 100vw, 50vw" className="mt-4 h-auto max-h-72 w-full rounded-lg object-cover" />}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Par {drop.author.displayName}</span>
          <div className="flex items-center gap-3">
            <Link href={`/drops/${drop.id}#commentaires`} className="text-sm text-muted-foreground transition hover:text-primary">
              <LiveCommentCount key={drop.id} dropId={drop.id} initialCount={drop.commentsCount} /> 💬
            </Link>
            {drop.isMine && <DeleteDropButton id={drop.id} />}
            <LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} />
          </div>
        </div>
      </article>)}
    </div> : <p className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">Aucun drop ne correspond à ta recherche.</p>}
    {result.totalPages > 1 && <nav className="mt-8 flex justify-center gap-4" aria-label="Pagination">
      {result.page > 1 && <Link className="rounded-md border px-4 py-2" href={`?${new URLSearchParams(Object.entries({ ...params, page: String(result.page - 1) }).filter((entry): entry is [string, string] => entry[1] !== undefined))}`}>Précédent</Link>}
      <span className="py-2 text-sm">Page {result.page} / {result.totalPages}</span>
      {result.page < result.totalPages && <Link className="rounded-md border px-4 py-2" href={`?${new URLSearchParams(Object.entries({ ...params, page: String(result.page + 1) }).filter((entry): entry is [string, string] => entry[1] !== undefined))}`}>Suivant</Link>}
    </nav>}
  </main>
}
