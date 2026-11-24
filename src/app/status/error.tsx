'use client'

import { RouteError } from '@/components/route-error'

export default function StatusError({ retry }: { error: unknown; retry: () => void }) {
  return <RouteError title="Vérification impossible" message="L’état de l’API n’a pas pu être récupéré. Réessaie dans un instant." retry={retry} />
}
