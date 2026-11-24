'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

export type Coordinates = { lat: number; lng: number }
export type LocationPickerMapProps = {
  position: Coordinates | null
  onPositionChange: (position: Coordinates) => void
}

const DEFAULT_CENTER: L.LatLngExpression = [47.51, 6.8]
const PICKER_ICON = L.divIcon({
  className: 'leaflet-pin-wrapper',
  html: '<span class="leaflet-drop-pin"></span>',
  iconSize: [30, 40],
  iconAnchor: [15, 38],
})

// Permet de choisir un point en cliquant sur la carte ou en déplaçant son repère.
export default function LocationPickerView({ position, onPositionChange }: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const placeRef = useRef<(coordinates: Coordinates, notify: boolean) => void>(() => {})
  const positionRef = useRef(position)
  const onPositionChangeRef = useRef(onPositionChange)

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
  }, [onPositionChange])

  useEffect(() => {
    if (!containerRef.current) return

    const initial = positionRef.current
    const map = L.map(containerRef.current, { scrollWheelZoom: false })
      .setView(initial ? [initial.lat, initial.lng] : DEFAULT_CENTER, initial ? 15 : 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    function place(coordinates: Coordinates, notify: boolean) {
      const point = L.latLng(coordinates.lat, coordinates.lng)
      let marker = markerRef.current
      if (!marker) {
        marker = L.marker(point, { icon: PICKER_ICON, draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const moved = marker?.getLatLng()
          if (moved) onPositionChangeRef.current({ lat: moved.lat, lng: moved.lng })
        })
        markerRef.current = marker
      } else {
        marker.setLatLng(point)
      }
      if (notify) onPositionChangeRef.current(coordinates)
    }

    placeRef.current = place
    if (initial) place(initial, false)
    map.on('click', event => {
      place({ lat: event.latlng.lat, lng: event.latlng.lng }, true)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      placeRef.current = () => {}
    }
  }, [])

  // Synchronise aussi le repère quand la position vient du bouton GPS ou des champs.
  useEffect(() => {
    if (!position) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    const map = mapRef.current
    placeRef.current(position, false)
    if (!map) return

    const point = L.latLng(position.lat, position.lng)
    if (map.getCenter().distanceTo(point) > 100) map.setView(point, Math.max(map.getZoom(), 15))
  }, [position])

  return <div ref={containerRef} role="application" aria-label="Choisir la position du drop" className="h-72 w-full rounded-2xl sm:h-80" />
}
