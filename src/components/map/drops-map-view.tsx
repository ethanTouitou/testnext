'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Drop } from '@/lib/api/types'

export type DropsMapProps = {
  drops: Pick<Drop, 'id' | 'title' | 'location'>[]
  activeId: number | null
  onSelect?: (id: number) => void
}

const DEFAULT_CENTER: L.LatLngExpression = [47.51, 6.8]
const NORMAL_MARKER: L.CircleMarkerOptions = { radius: 8, color: '#a78bfa', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.9 }
const ACTIVE_MARKER: L.CircleMarkerOptions = { radius: 12, color: '#fff', weight: 3, fillColor: '#c084fc', fillOpacity: 1 }

// Crée la carte une fois, puis synchronise ses marqueurs avec les drops affichés.
export default function DropsMapView({ drops, activeId, onSelect }: DropsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef(new Map<number, L.CircleMarker>())
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return

    const markers = markersRef.current
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(DEFAULT_CENTER, 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
      markers.clear()
    }
  }, [])

  // Les filtres et la pagination déterminent exactement quels drops apparaissent ici.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    markersRef.current.clear()

    const points: L.LatLng[] = []
    for (const drop of drops) {
      const { lat, lng } = drop.location
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue

      const point = L.latLng(lat, lng)
      points.push(point)
      const marker = L.circleMarker(point, NORMAL_MARKER)
        .bindTooltip(drop.title, { direction: 'top' })
        .on('click', () => onSelectRef.current?.(drop.id))
        .addTo(layer)
      markersRef.current.set(drop.id, marker)
    }

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 13)
    } else if (points.length === 1) {
      map.setView(points[0], 15)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 15 })
    }
  }, [drops])

  // Met en avant le marqueur sélectionné et recentre la carte sur lui.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    for (const [id, marker] of markersRef.current) {
      marker.setStyle(id === activeId ? ACTIVE_MARKER : NORMAL_MARKER)
      if (id === activeId) marker.bringToFront()
    }

    const activeMarker = activeId === null ? undefined : markersRef.current.get(activeId)
    if (activeMarker) map.flyTo(activeMarker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.35 })
  }, [activeId, drops])

  return <div ref={containerRef} role="region" aria-label="Carte des drops" className="h-full min-h-72 w-full rounded-2xl" />
}
