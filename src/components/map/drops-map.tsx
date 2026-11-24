'use client'

import dynamic from 'next/dynamic'
import type { DropsMapProps } from './drops-map-view'

// Leaflet a besoin du DOM : Next charge la carte uniquement dans le navigateur.
const ClientDropsMap = dynamic<DropsMapProps>(() => import('./drops-map-view'), {
  ssr: false,
  loading: () => <div aria-busy="true" className="flex h-full min-h-72 w-full items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">Chargement de la carte…</div>,
})

export function DropsMap(props: DropsMapProps) {
  return <ClientDropsMap {...props} />
}
