// Formulaire de recherche qui transmet le texte dans le paramètre d'URL « q ».
export function SearchBox({ query = '' }: { query?: string }) {
  return <form action="/drops" className="flex gap-2">
    <input name="q" defaultValue={query} placeholder="Rechercher un drop…" aria-label="Rechercher un drop"
      className="w-full rounded-xl border border-input bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25" />
    <button className="shrink-0 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90">Rechercher</button>
  </form>
}
