// Présente l'application et guide directement vers la connexion ou les drops.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-16 sm:py-24">
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" />
            Les idées se partagent
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Découvre les <span className="text-primary">drops</span> autour de toi.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Des messages, des photos et des recommandations à découvrir et à partager avec la communauté.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/login" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90">Se connecter</a>
            <a href="/drops" className="rounded-xl border border-border bg-card px-5 py-3 font-semibold transition hover:border-primary/50 hover:bg-accent">Explorer les drops</a>
          </div>
        </section>
        <aside aria-label="Aperçu d'un drop" className="relative mx-auto w-full max-w-md">
          <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] bg-primary/15 blur-2xl" />
          <article className="relative rounded-3xl border border-white/10 bg-card/90 p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Recommandation</span>
              <span className="text-xs text-muted-foreground">À découvrir</span>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-xl">✦</div>
            <h2 className="mt-5 text-xl font-semibold">Un petit coin à découvrir</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Partage tes bonnes adresses et découvre celles de la communauté.</p>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
              <span>Près de la communauté</span><span className="text-primary">♡ 12</span>
            </div>
          </article>
        </aside>
      </div>
    </main>
  )
}
