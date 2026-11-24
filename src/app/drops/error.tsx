'use client'

import { RouteError } from '@/components/route-error'

export default function DropsError({ retry }: { error: unknown; retry: () => void }) {
  return <RouteError title="Impossible de charger les drops" message="Le service ne répond pas correctement. Réessaie dans un instant." retry={retry} />
}
