'use client'

import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationPickerMap } from '@/components/map/location-picker-map'
import { createDrop, deleteDrop, reportDrop } from '@/lib/actions/drops'

// Formulaire de création, avec récupération facultative des coordonnées GPS.
export function CreateDropForm() {
  const [state, action, pending] = useActionState(createDrop, {})
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const mapPosition = latitude && longitude && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? { lat: Number(latitude), lng: Number(longitude) }
    : null

  // Récupère la position du navigateur et remplit latitude et longitude.
  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }

    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(String(coords.latitude))
        setLongitude(String(coords.longitude))
        setLocating(false)
      },
      error => {
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Autorise l’accès à ta position dans les réglages du navigateur.'
          : 'Position indisponible. Réessaie ou saisis les coordonnées manuellement.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return <details id="creation-drop" className="mb-6 overflow-hidden rounded-2xl border border-primary/25 bg-card/70 shadow-lg shadow-black/10 open:border-primary/40 open:shadow-primary/5">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6">
      <span><span className="block font-semibold">Créer un drop</span><span className="mt-1 block text-sm text-muted-foreground">Partage une idée, une photo ou une recommandation géolocalisée.</span></span>
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xl text-primary-foreground">+</span>
    </summary>
    <form action={action} className="grid gap-3 border-t border-border px-5 py-5 sm:px-6">
    <input name="title" required minLength={3} maxLength={80} placeholder="Titre (3 à 80 caractères)" className="rounded-xl border border-input px-4 py-3" />
    <textarea name="content" required maxLength={1000} placeholder="Ton message (1000 caractères maximum)" className="min-h-24 rounded-xl border border-input px-4 py-3" />
    <select name="category" defaultValue="note" className="rounded-xl border border-input px-4 py-3">
      <option value="note">Un mot</option>
      <option value="photo">Une photo</option>
      <option value="tip">Une recommandation</option>
      <option value="riddle">Une énigme</option>
    </select>
    <input name="imageUrl" type="url" maxLength={500} placeholder="URL de l’image (obligatoire pour une photo)" className="rounded-xl border border-input px-4 py-3" />
    <button type="button" onClick={getCurrentLocation} disabled={locating} className="w-fit rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-50">
      {locating ? 'Localisation…' : 'Utiliser ma position actuelle'}
    </button>
    {locationError && <p role="alert" className="text-sm text-red-600">{locationError}</p>}
    <p className="text-sm text-muted-foreground">Clique sur la carte pour choisir l’emplacement, puis déplace le repère si besoin.</p>
    <LocationPickerMap
      position={mapPosition}
      onPositionChange={position => {
        setLatitude(String(position.lat))
        setLongitude(String(position.lng))
      }}
    />
    <div className="grid gap-3 sm:grid-cols-2">
      <input name="lat" type="number" min="-90" max="90" step="any" required value={latitude} onChange={event => setLatitude(event.target.value)} placeholder="Latitude" className="rounded-md border px-3 py-2" />
      <input name="lng" type="number" min="-180" max="180" step="any" required value={longitude} onChange={event => setLongitude(event.target.value)} placeholder="Longitude" className="rounded-md border px-3 py-2" />
    </div>
    <p className="text-xs text-muted-foreground">Indique où le drop doit apparaître sur la carte.</p>
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
    <button disabled={pending} className="w-fit rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
      {pending ? 'Création…' : 'Créer le drop'}
    </button>
    </form>
  </details>
}

// Suppression accessible depuis la page du drop et séparée de son formulaire de modification.
export function DeleteDropButton({ id }: { id: number }) {
  const actionWithId = deleteDrop.bind(null, id)
  const [state, action, pending] = useActionState(actionWithId, {})
  const router = useRouter()

  useEffect(() => {
    if (!state.success) return
    router.push('/drops')
    router.refresh()
  }, [router, state.success])

  return <form action={action} onSubmit={event => {
    if (!window.confirm('Supprimer définitivement ce drop et ses commentaires ?')) event.preventDefault()
  }}>
    <button type="submit" disabled={pending} className="rounded-lg border border-destructive/35 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-50">
      {pending ? 'Suppression…' : 'Supprimer le drop'}
    </button>
    {state.error && <p role="alert" className="mt-1 text-xs text-red-600">{state.error}</p>}
  </form>
}

export function ReportDropForm({ id }: { id: number }) {
  const actionWithId = reportDrop.bind(null, id)
  const [state, action, pending] = useActionState(actionWithId, {})
  const [open, setOpen] = useState(false)

  return <details open={open} onToggle={event => setOpen(event.currentTarget.open)} className="mt-5 rounded-xl border border-border bg-background/40 p-4">
    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">Signaler ce drop</summary>
    <form action={action} className="mt-4 grid gap-3">
      <label className="grid gap-1 text-sm">Motif du signalement
        <select name="reason" required defaultValue="" className="rounded-lg border border-input px-3 py-2">
          <option value="" disabled>Choisis un motif</option>
          <option value="spam">Spam</option>
          <option value="offensive">Contenu offensant</option>
          <option value="personal_info">Informations personnelles</option>
          <option value="other">Autre</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">Détail (facultatif)
        <textarea name="details" maxLength={300} placeholder="Explique brièvement le problème" className="min-h-20 rounded-lg border border-input px-3 py-2" />
      </label>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
      <button type="submit" disabled={pending || Boolean(state.success)} className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-primary/50 disabled:opacity-50">
        {pending ? 'Envoi…' : 'Envoyer le signalement'}
      </button>
    </form>
  </details>
}
