import { Suspense } from 'react';

// Encadre la vérification de l'API par un état de chargement.
export default function StatusPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Health />
        </Suspense>
    );
}

// Interroge l'endpoint de santé et affiche si l'API répond.
async function Health() {
    const res = await fetch(`${process.env.API_URL}/health`)
    return <p>{res.ok ? 'Healthy' : 'Unhealthy'} </p>
};
