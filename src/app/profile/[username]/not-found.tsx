import Link from 'next/link'

export default function PublicProfileNotFound() {
  return (
    <main>
      <h1>Profil introuvable</h1>
      <p>Ce nom d’utilisateur n’existe pas ou le profil n’est plus disponible.</p>
      <Link href="/drops" className="text-sm text-muted-foreground transition hover:text-primary">Retour aux drops</Link>
    </main>
  )
}
