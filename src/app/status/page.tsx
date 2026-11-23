import { Suspense } from 'react';

// Encadre la vérification de l'API par un état de chargement.
export default function StatusPage() {
    return (
        <Suspense fallback={<main className="mx-auto flex flex-1 items-center px-5 py-10 text-muted-foreground">Vérification de l’API…</main>}>
            <Health />
        </Suspense>
    );
}

// Interroge l'endpoint de santé et affiche si l'API répond.
async function Health() {
    const res = await fetch(`${process.env.API_URL}/health`)
    return <main className="mx-auto flex w-full max-w-5xl flex-1 items-start px-5 py-12">
        <section className="w-full rounded-2xl border border-white/10 bg-card/70 p-6 sm:p-8">
            <h1 className="text-2xl font-bold">État du service</h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                <span className={`size-2.5 rounded-full ${res.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                API {res.ok ? 'disponible' : 'indisponible'}
            </p>
        </section>
    </main>
};
