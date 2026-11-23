import type { Category } from '@/lib/api/types'

// Affiche les catégories et construit les liens en gardant les autres filtres actifs.
export function Categories({ categories, selected, query = '', sort = 'recent' }: {
  categories: Category[]
  selected?: string
  query?: string
  sort?: string
}) {
  // Crée l'URL correspondant à la catégorie sélectionnée.
  function href(category: string) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (sort !== 'recent') params.set('sort', sort)
    if (category) params.set('category', category)
    return `/drops${params.size ? `?${params}` : ''}`
  }

  return <nav className="flex flex-wrap gap-2" aria-label="Catégories">
    {[{ id: '', label: 'Tout' }, ...categories].map(category => <a
      key={category.id || 'all'} href={href(category.id)}
      className={`rounded-full px-4 py-2 text-sm transition ${(selected ?? '') === category.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
      {category.label}
    </a>)}
  </nav>
}
