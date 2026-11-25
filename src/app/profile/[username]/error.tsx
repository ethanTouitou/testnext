'use client'

import { RouteError } from '@/components/route-error'

export default function PublicProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError title="Impossible de charger ce profil" message="Le profil ou ses drops sont temporairement indisponibles. Réessaie dans un instant." retry={reset} />
}
