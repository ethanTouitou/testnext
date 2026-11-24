'use client'

import { useState } from 'react'
import type { Category, Drop } from '@/lib/api/types'
import { DropsMap } from '@/components/map/drops-map'
import { DropCard } from './drop-card'

// Partage la sélection entre la liste et la carte des résultats courants.
export function DropsExplorer({ drops, categories }: { drops: Drop[]; categories: Category[] }) {
  const [activeId, setActiveId] = useState<number | null>(null)

  function selectFromMap(id: number) {
    setActiveId(id)
    requestAnimationFrame(() => {
      document.getElementById(`drop-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <ul className="space-y-4" aria-label="Drops affichés sur la carte">
        {drops.map(drop => (
          <li key={drop.id}>
            <DropCard
              drop={drop}
              category={categories.find(item => item.id === drop.category)?.label ?? drop.category}
              active={drop.id === activeId}
              onActivate={setActiveId}
            />
          </li>
        ))}
      </ul>
      <div className="order-first h-[24rem] lg:order-none lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <DropsMap drops={drops} activeId={activeId} onSelect={selectFromMap} />
      </div>
    </div>
  )
}
