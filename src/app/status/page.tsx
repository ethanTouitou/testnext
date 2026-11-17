import { Suspense } from 'react';

export default function StatusPage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <Health />
        </Suspense>
    );
}

async function Health() {
    const res = await fetch(`${process.env.API_URL}/health`)
    return <p>{res.ok ? 'Healthy' : 'Unhealthy'} </p>
};