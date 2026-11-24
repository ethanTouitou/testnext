'use client'

import { RouteError } from '@/components/route-error'

export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return <RouteError title="Une erreur est survenue" message="La page n’a pas pu être affichée. Réessaie ou retourne aux drops." retry={retry} />
}
