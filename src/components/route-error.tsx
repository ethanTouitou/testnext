'use client'

// Affiche une erreur claire et permet de relancer le rendu du segment.
export function RouteError({ title, message, retry }: {
  title: string
  message: string
  retry: () => void
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-xl text-red-300" aria-hidden="true">!</span>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-muted-foreground">{message}</p>
      <button onClick={retry} className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90">Réessayer</button>
    </main>
  )
}
