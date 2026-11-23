'use client'

import { useActionState, useState } from 'react'
import { updateDrop } from '@/lib/actions/drops'
import type { Drop } from '@/lib/api/types'

// Affiche le formulaire de modification d'un post appartenant à l'utilisateur.
export function EditDropForm({ drop }: { drop: Drop }) {
  const actionWithId = updateDrop.bind(null, drop.id)
  const [state, action, pending] = useActionState(actionWithId, {})
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return <button type="button" onClick={() => setEditing(true)} className="mb-6 text-sm font-medium text-primary hover:underline">
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
    {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    <div className="flex gap-3">
      <button disabled={pending} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground">Annuler</button>
    </div>
  </form>
}
