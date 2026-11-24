import Link from 'next/link'

// Affiche une vraie page 404 quand une route ou un drop n'existe pas.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="text-sm font-semibold tracking-[0.25em] text-primary">404</span>
      <h1 className="mt-3 text-3xl font-bold">Cette page est introuvable</h1>
      <p className="mt-3 text-muted-foreground">Le lien est peut-être incorrect ou ce contenu a été supprimé.</p>
      <Link href="/drops" className="mt-7 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">Retour aux drops</Link>
    </main>
  )
}
