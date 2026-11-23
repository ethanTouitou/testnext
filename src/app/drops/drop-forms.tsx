'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import { createDrop, deleteDrop } from '@/lib/actions/drops'

// Formulaire de création, avec récupération facultative des coordonnées GPS.
export function CreateDropForm() {
  const [state, action, pending] = useActionState(createDrop, {})
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

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

  return <form action={action} className="mb-8 grid gap-3 rounded-2xl border border-white/10 bg-card/70 p-5 shadow-lg shadow-black/10 sm:p-6">
    <h2 className="text-lg font-semibold">Créer un drop</h2>
    <input name="title" required minLength={3} placeholder="Titre" className="rounded-xl border border-input px-4 py-3" />
    <textarea name="content" required placeholder="Ton message" className="min-h-24 rounded-xl border border-input px-4 py-3" />
    <select name="category" defaultValue="note" className="rounded-xl border border-input px-4 py-3">
      <option value="note">Un mot</option>
      <option value="photo">Une photo</option>
      <option value="tip">Une recommandation</option>
      <option value="riddle">Une énigme</option>
    </select>
    <input name="imageUrl" type="url" placeholder="URL de l’image (obligatoire pour une photo)" className="rounded-xl border border-input px-4 py-3" />
    <button type="button" onClick={getCurrentLocation} disabled={locating} className="w-fit rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-50">
      {locating ? 'Localisation…' : 'Utiliser ma position actuelle'}
    </button>
    {locationError && <p role="alert" className="text-sm text-red-600">{locationError}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <input name="lat" type="number" step="any" required value={latitude} onChange={event => setLatitude(event.target.value)} placeholder="Latitude" className="rounded-md border px-3 py-2" />
      <input name="lng" type="number" step="any" required value={longitude} onChange={event => setLongitude(event.target.value)} placeholder="Longitude" className="rounded-md border px-3 py-2" />
    </div>
    <p className="text-xs text-muted-foreground">Indique où le drop doit apparaître sur la carte.</p>
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
    <button disabled={pending} className="w-fit rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
      {pending ? 'Création…' : 'Créer le drop'}
    </button>
  </form>
}

// Bouton de suppression protégé par une confirmation et réservé au propriétaire.
export function DeleteDropButton({ id }: { id: number }) {
  const actionWithId = deleteDrop.bind(null, id)
  const [state, action, pending] = useActionState(actionWithId, {})

  return <form action={action} onSubmit={event => {
    if (!window.confirm('Supprimer ce drop ?')) event.preventDefault()
  }}>
    <button disabled={pending} className="text-sm text-red-400 hover:underline disabled:opacity-50">
      {pending ? 'Suppression…' : 'Supprimer'}
    </button>
    {state.error && <p role="alert" className="mt-1 text-xs text-red-600">{state.error}</p>}
  </form>
}
