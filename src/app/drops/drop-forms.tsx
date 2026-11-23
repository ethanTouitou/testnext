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

  return <form action={action} className="mb-8 grid gap-3 rounded-xl border border-zinc-200 p-5">
    <h2 className="text-lg font-semibold">Créer un drop</h2>
    <input name="title" required minLength={3} placeholder="Titre" className="rounded-md border px-3 py-2" />
    <textarea name="content" required placeholder="Ton message" className="min-h-24 rounded-md border px-3 py-2" />
    <select name="category" defaultValue="note" className="rounded-md border bg-white px-3 py-2">
      <option value="note">Un mot</option>
      <option value="photo">Une photo</option>
      <option value="tip">Une recommandation</option>
      <option value="riddle">Une énigme</option>
    </select>
    <input name="imageUrl" type="url" placeholder="URL de l’image (obligatoire pour une photo)" className="rounded-md border px-3 py-2" />
    <button type="button" onClick={getCurrentLocation} disabled={locating} className="w-fit rounded-md border px-3 py-2 text-sm disabled:opacity-50">
      {locating ? 'Localisation…' : 'Utiliser ma position actuelle'}
    </button>
    {locationError && <p role="alert" className="text-sm text-red-600">{locationError}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <input name="lat" type="number" step="any" required value={latitude} onChange={event => setLatitude(event.target.value)} placeholder="Latitude" className="rounded-md border px-3 py-2" />
      <input name="lng" type="number" step="any" required value={longitude} onChange={event => setLongitude(event.target.value)} placeholder="Longitude" className="rounded-md border px-3 py-2" />
    </div>
    <p className="text-xs text-zinc-500">Indique où le drop doit apparaître sur la carte.</p>
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
    <button disabled={pending} className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">
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
    <button disabled={pending} className="text-sm text-red-600 hover:underline disabled:opacity-50">
      {pending ? 'Suppression…' : 'Supprimer'}
    </button>
    {state.error && <p role="alert" className="mt-1 text-xs text-red-600">{state.error}</p>}
  </form>
}
