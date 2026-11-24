'use client'

import './globals.css'
import { RouteError } from '@/components/route-error'

// Capture les erreurs du layout racine, que error.tsx ne couvre pas.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <RouteError title="L’application a rencontré une erreur" message="Réessaie de charger l’application." retry={retry} />
      </body>
    </html>
  )
}
