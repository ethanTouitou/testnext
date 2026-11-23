// Formulaire de recherche qui transmet le texte dans le paramètre d'URL « q ».
export function SearchBox({ query = '' }: { query?: string }) {
  return <form action="/drops" className="flex gap-2">
    <input name="q" defaultValue={query} placeholder="Rechercher un drop…" aria-label="Rechercher un drop"
      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2" />
    <button className="rounded-md bg-zinc-900 px-4 py-2 text-white">Rechercher</button>
  </form>
}
