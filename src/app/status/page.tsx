import { apiGet } from '@/lib/api/client'
import type { Health } from '@/lib/api/types'

// Lit l'état de santé de l'API ; status/error.tsx affiche les erreurs réseau.
export default async function StatusPage() {
  const health = await apiGet<Health>('/health')
  const healthy = health.status === 'ok' && health.db === 'ok'

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-start px-5 py-12">
      <section className="w-full rounded-2xl border border-white/10 bg-card/70 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">État du service</h1>
        <p className="mt-3 flex items-center gap-2 text-muted-foreground">
          <span className={`size-2.5 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          API {healthy ? 'disponible' : 'dégradée'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Base de données : {health.db === 'ok' ? 'disponible' : 'indisponible'}</p>
      </section>
    </main>
  )
}
