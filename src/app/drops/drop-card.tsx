'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Drop } from '@/lib/api/types'
import { LiveCommentCount } from '@/components/live-comment-count'
import { DeleteDropButton } from './drop-forms'
import { LikeButton } from './like-button'

const dropDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

// Une carte de liste signale au parent quel drop doit être mis en avant sur la carte.
export function DropCard({ drop, category, active, onActivate }: {
  drop: Drop
  category: string
  active: boolean
  onActivate: (id: number) => void
}) {
  return (
    <article
      id={`drop-${drop.id}`}
      onMouseEnter={() => onActivate(drop.id)}
      onFocusCapture={() => onActivate(drop.id)}
      onClick={() => onActivate(drop.id)}
      className={`rounded-2xl border bg-card/80 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 ${active ? 'border-primary ring-1 ring-primary/40' : 'border-white/10 hover:border-primary/30'}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs capitalize text-primary">{category}</span>
        <time className="text-xs text-muted-foreground">{dropDate.format(new Date(drop.createdAt))}</time>
      </div>
      <h2 className="mb-2 text-lg font-semibold">
        <Link href={`/drops/${drop.id}`} className="transition hover:text-primary">{drop.title}</Link>
      </h2>
      {drop.content && <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{drop.content}</p>}
      {drop.imageUrl && <Image src={drop.imageUrl} alt="" width={1200} height={800} unoptimized loading="lazy" sizes="(max-width: 640px) 100vw, 50vw" className="mt-4 h-auto max-h-72 w-full rounded-lg object-cover" />}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Par {drop.author.displayName}</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onActivate(drop.id)} className="text-xs text-primary transition hover:underline">Voir sur la carte</button>
          <Link href={`/drops/${drop.id}#commentaires`} className="text-sm text-muted-foreground transition hover:text-primary">
            <LiveCommentCount dropId={drop.id} initialCount={drop.commentsCount} /> 💬
          </Link>
          {drop.isMine && <DeleteDropButton id={drop.id} />}
          <LikeButton id={drop.id} count={drop.likesCount} liked={drop.likedByMe} />
        </div>
      </div>
    </article>
  )
}
