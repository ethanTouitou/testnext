function Pulse({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-muted/80 ${className}`} />
}

// Squelette de la liste : garde la structure visible pendant le fetch des drops.
export function DropsLoading() {
  return (
    <main aria-busy="true" aria-label="Chargement des drops" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <span role="status" className="sr-only">Chargement des drops…</span>
      <Pulse className="mb-3 h-9 w-48" />
      <Pulse className="mb-8 h-5 w-80 max-w-full" />
      <Pulse className="mb-8 h-12 w-full" />
      <Pulse className="mb-5 h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => <Pulse key={index} className="h-56 rounded-2xl" />)}
      </div>
    </main>
  )
}

// Squelette du détail : réserve la place du post et de ses commentaires.
export function DropLoading() {
  return (
    <main aria-busy="true" aria-label="Chargement du drop" className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <span role="status" className="sr-only">Chargement du drop…</span>
      <Pulse className="mb-5 h-5 w-40" />
      <Pulse className="h-80 rounded-2xl" />
      <Pulse className="mt-8 h-12 rounded-xl" />
      <Pulse className="mt-4 h-24 rounded-xl" />
    </main>
  )
}

// Squelette du profil pendant la lecture des informations du compte.
export function ProfileLoading() {
  return (
    <main aria-busy="true" aria-label="Chargement du profil" className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <span role="status" className="sr-only">Chargement du profil…</span>
      <Pulse className="h-5 w-40" />
      <Pulse className="mt-5 h-72 rounded-2xl" />
    </main>
  )
}

// Squelette du contrôle de santé pendant le contact avec l'API.
export function StatusLoading() {
  return (
    <main aria-busy="true" aria-label="Vérification de l’API" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
      <span role="status" className="sr-only">Vérification de l’API…</span>
      <Pulse className="h-36 rounded-2xl" />
    </main>
  )
}
