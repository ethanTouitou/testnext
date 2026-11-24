'use client'

import { RouteError } from '@/components/route-error'

export default function DropError({ retry }: { error: unknown; retry: () => void }) {
  return <RouteError title="Impossible de charger ce drop" message="Le post n’a pas pu être récupéré. Vérifie ta connexion puis réessaie." retry={retry} />
}
