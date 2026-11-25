import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ApiError, apiGet } from '@/lib/api/client'
import { requireSession } from '@/lib/session'
import type { DropPage, Profile } from '@/lib/api/types'
import { Badge } from '@/components/ui/badge'

type Props = {
    params: Promise<{ username: string }>
    searchParams: Promise<{ page?: string }>
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

// Profil public : les données viennent du serveur et les routes de l'API sont publiques.
export default async function PublicProfilePage({ params, searchParams }: Props) {
    const [{ username }, query] = await Promise.all([params, searchParams])
    const token = await requireSession()
    const pageValue = Number(query.page ?? '1')
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
    const encodedUsername = encodeURIComponent(username)
    const dropsQuery = new URLSearchParams({
        author: username,
        page: String(page),
        pageSize: '12',
        sort: 'recent',
    })

    let profile: Profile
    let drops: DropPage
    try {
        ;[profile, drops] = await Promise.all([
            apiGet<Profile>(`/users/${encodedUsername}`, token),
            apiGet<DropPage>(`/drops?${dropsQuery.toString()}`, token),
        ])
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) redirect('/login')
        if (error instanceof ApiError && error.status === 404) notFound()
        throw error
    }

    const totalPages = Math.max(drops.totalPages, 1)
    const initials = profile.displayName.trim().slice(0, 1).toUpperCase() || profile.username.slice(0, 1).toUpperCase()

    return (
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
            <Link href="/drops" className="text-sm ">← Retour aux drops</Link>

            <section className="mt-5 rounded-2xl border border-white/10 ">
                <div className="flex items-center gap-4">
                    {profile.avatarUrl ? (
                        <Image src={profile.avatarUrl} alt={`Avatar de ${profile.displayName}`} width={80} height={80} unoptimized className="size-20 rounded-full object-cover" />
                    ) : (
                        <span aria-hidden="true">{initials}</span>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                        <p className="">@{profile.username}</p>
                    </div>
                </div>

                {profile.bio && <p className="mt-5 leading-6">{profile.bio}</p>}
                <p className="mt-4 text-sm ">Membre depuis le {dateFormat.format(new Date(profile.createdAt))}</p>

                <dl className="mt-8 border-t border-border pt-6">
                    <div><dt className="text-sm">Drops</dt><dd>{profile.stats.dropsCount}</dd></div>
                    <div><dt className="text-sm">Likes reçus</dt><dd>{profile.stats.likesReceived}</dd></div>
                    <div><dt className="text-sm">Commentaires</dt><dd>{profile.stats.commentsCount}</dd></div>
                </dl>
            </section>

            <section className="mt-8 border-t border-border pt-6" aria-labelledby="profile-drops-title">
                <div>
                    <h2 id="profile-drops-title" className="mb-4 text-xl font-semibold">Ses drops ({drops.total})</h2>
                </div>
                {drops.items.length ? (
                    <ul>
                        {drops.items.map(drop => (
                            <li key={drop.id} className="mb-4 rounded-2xl border border-white/10 bg-card/80 p-5 shadow-lg shadow-black/10">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <Badge className="rounded-full bg-primary/15 px-3 py-1 text-xs capitalize text-primary">{drop.category}</Badge>
                                    <time className="text-xs">{dateFormat.format(new Date(drop.createdAt))}</time>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold"><Link className="transition hover:text-primary" href={`/drops/${drop.id}`}>{drop.title}</Link></h3>
                                {drop.content && <p className="whitespace-pre-wrap text-sm leading-6">{drop.content}</p>}
                                {drop.imageUrl && <Image src={drop.imageUrl} alt="" width={1200} height={800} unoptimized loading="lazy" sizes="(max-width: 640px) 100vw, 50vw" className="mt-4 h-auto max-h-72 w-full rounded-lg object-cover" />}
                                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                    <span className="text-sm">{drop.likesCount} likes · {drop.commentsCount} commentaires</span>
                                    <Link href={`/drops/${drop.id}`} className="text-sm transition hover:text-primary">Voir le drop</Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm">Cette personne n’a pas encore publié de drop.</p>
                )}

                {totalPages > 1 && <nav className="mt-5 flex items-center gap-4" aria-label="Pages des drops">
                    {page > 1 && <Link className="text-sm transition hover:text-primary" href={`/profile/${encodedUsername}?page=${page - 1}`}>Précédent</Link>}
                    <span className="text-sm">Page {drops.page} / {totalPages}</span>
                    {page < totalPages && <Link className="text-sm transition hover:text-primary" href={`/profile/${encodedUsername}?page=${page + 1}`}>Suivant</Link>}
                </nav>}
            </section>
        </main>
    )
}
