'use client'

import { useActionState } from 'react'
import { createComment } from '@/lib/actions/drops'

// Envoie un commentaire au serveur et affiche le résultat de l'envoi.
export function CommentForm({ dropId }: { dropId: number }) {
  const actionWithId = createComment.bind(null, dropId)
  const [state, action, pending] = useActionState(actionWithId, {})

  return <form action={action} className="mb-5 rounded-2xl border border-white/10 bg-card/70 p-4 sm:p-5">
    <label htmlFor="comment-content" className="mb-2 block text-sm font-medium">Ajouter un commentaire</label>
    <textarea id="comment-content" name="content" required maxLength={500} placeholder="Écris ton commentaire…" className="min-h-20 w-full rounded-xl border border-input px-4 py-3 text-sm" />
    {state.error && <p role="alert" className="mt-2 text-sm text-red-600">{state.error}</p>}
    {state.success && <p role="status" className="mt-2 text-sm text-green-700">{state.success}</p>}
    <button disabled={pending} className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
      {pending ? 'Envoi…' : 'Commenter'}
    </button>
  </form>
}
