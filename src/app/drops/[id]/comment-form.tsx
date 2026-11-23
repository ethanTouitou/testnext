'use client'

import { useActionState } from 'react'
import { createComment } from '@/lib/actions/drops'

// Envoie un commentaire au serveur et affiche le résultat de l'envoi.
export function CommentForm({ dropId }: { dropId: number }) {
  const actionWithId = createComment.bind(null, dropId)
  const [state, action, pending] = useActionState(actionWithId, {})

  return <form action={action} className="mb-5 rounded-lg border border-zinc-200 bg-white p-4">
    <label htmlFor="comment-content" className="mb-2 block text-sm font-medium">Ajouter un commentaire</label>
    <textarea id="comment-content" name="content" required maxLength={500} placeholder="Écris ton commentaire…" className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
    {state.error && <p role="alert" className="mt-2 text-sm text-red-600">{state.error}</p>}
    {state.success && <p role="status" className="mt-2 text-sm text-green-700">{state.success}</p>}
    <button disabled={pending} className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50">
      {pending ? 'Envoi…' : 'Commenter'}
    </button>
  </form>
}
