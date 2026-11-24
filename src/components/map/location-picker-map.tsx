'use client'

import dynamic from 'next/dynamic'
import type { LocationPickerMapProps } from './location-picker-view'

// Le sélecteur reste côté navigateur afin de ne pas initialiser Leaflet pendant le SSR.
const ClientLocationPicker = dynamic<LocationPickerMapProps>(() => import('./location-picker-view'), {
  ssr: false,
  loading: () => <div aria-busy="true" className="flex h-72 w-full items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground sm:h-80">Chargement de la carte…</div>,
})

export function LocationPickerMap(props: LocationPickerMapProps) {
  return <ClientLocationPicker {...props} />
}
