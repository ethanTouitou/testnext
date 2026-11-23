'use client'

// Affiche un message et permet de relancer le chargement après une erreur.
export default function DropsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
    <h1 className="mb-2 text-2xl font-bold">Impossible de charger les drops</h1>
    <p className="mb-6 text-muted-foreground">Le service ne répond pas correctement. Réessaie dans un instant.</p>
    <button onClick={reset} className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90">Réessayer</button>
  </main>
}
