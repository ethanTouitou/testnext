'use client'

import { RouteError } from '@/components/route-error'

export default function ProfileError({ retry }: { error: unknown; retry: () => void }) {
  return <RouteError title="Impossible de charger ton profil" message="Les informations du compte sont temporairement indisponibles." retry={retry} />
}
