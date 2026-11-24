'use client'

import { useActionState, useState } from 'react'
import { updateDrop } from '@/lib/actions/drops'
import { LocationPickerMap } from '@/components/map/location-picker-map'
import type { Drop } from '@/lib/api/types'

// Affiche le formulaire de modification d'un post appartenant à l'utilisateur.
export function EditDropForm({ drop }: { drop: Drop }) {
  const actionWithId = updateDrop.bind(null, drop.id)
  const [state, action, pending] = useActionState(actionWithId, {})
  const [editing, setEditing] = useState(false)
  const [latitude, setLatitude] = useState(String(drop.location.lat))
  const [longitude, setLongitude] = useState(String(drop.location.lng))
  const mapPosition = latitude !== '' && longitude !== '' && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? { lat: Number(latitude), lng: Number(longitude) }
    : null

  if (!editing) {
    return <button type="button" onClick={() => {
      setLatitude(String(drop.location.lat))
      setLongitude(String(drop.location.lng))
      setEditing(true)
    }} className="mb-6 text-sm font-medium text-primary hover:underline">
      Modifier mon post
    </button>
  }

  return <form action={action} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-background/60 p-4">
    <label className="grid gap-1 text-sm">Titre
      <input name="title" required minLength={3} defaultValue={drop.title} className="rounded-xl border border-input px-4 py-3" />
    </label>
    <label className="grid gap-1 text-sm">Contenu
      <textarea name="content" required defaultValue={drop.content ?? ''} className="min-h-24 rounded-xl border border-input px-4 py-3" />
    </label>
    <label className="grid gap-1 text-sm">Catégorie
      <select name="category" defaultValue={drop.category} className="rounded-xl border border-input px-4 py-3">
        <option value="note">Un mot</option>
        <option value="photo">Une photo</option>
        <option value="tip">Une recommandation</option>
        <option value="riddle">Une énigme</option>
      </select>
    </label>
    <label className="grid gap-1 text-sm">URL de l’image
      <input name="imageUrl" type="url" defaultValue={drop.imageUrl ?? ''} className="rounded-xl border border-input px-4 py-3" />
    </label>
    <div className="grid gap-2">
      <p className="text-sm font-medium">Position du drop</p>
      <p className="text-xs text-muted-foreground">Déplace le repère pour changer l’emplacement, ou clique ailleurs sur la carte.</p>
      <LocationPickerMap
        position={mapPosition}
        onPositionChange={position => {
          setLatitude(String(position.lat))
          setLongitude(String(position.lng))
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs text-muted-foreground">Latitude
          <input name="lat" type="number" min="-90" max="90" step="any" required value={latitude} onChange={event => setLatitude(event.target.value)} className="rounded-md border px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">Longitude
          <input name="lng" type="number" min="-180" max="180" step="any" required value={longitude} onChange={event => setLongitude(event.target.value)} className="rounded-md border px-3 py-2 text-sm text-foreground" />
        </label>
      </div>
    </div>
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    <div className="flex gap-3">
      <button disabled={pending} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button type="button" onClick={() => {
        setLatitude(String(drop.location.lat))
        setLongitude(String(drop.location.lng))
        setEditing(false)
      }} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground">Annuler</button>
    </div>
  </form>
}
