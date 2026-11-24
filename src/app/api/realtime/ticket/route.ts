import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

// Demande côté serveur un ticket temporaire sans exposer le JWT au navigateur.
export async function POST() {
  const token = await getSession()
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const apiUrl = process.env.API_URL
  if (!apiUrl) return NextResponse.json({ error: 'API_URL manquante' }, { status: 500 })

  try {
    const response = await fetch(`${apiUrl}/realtime/ticket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    const data = await response.json().catch(() => null) as { url?: unknown; error?: unknown } | null

    if (!response.ok) {
      const result = NextResponse.json({ error: data?.error ?? 'Impossible de créer le ticket.' }, { status: response.status })
      if (response.status === 401) result.cookies.delete('session')
      return result
    }
    if (typeof data?.url !== 'string') {
      return NextResponse.json({ error: 'URL WebSocket absente de la réponse.' }, { status: 502 })
    }

    // Seule l'URL contenant le ticket à usage unique est renvoyée au client.
    return NextResponse.json({ url: data.url })
  } catch {
    return NextResponse.json({ error: 'Impossible de joindre le serveur.' }, { status: 502 })
  }
}

// Efface la session si le WebSocket ferme avec le code session_expired.
export async function DELETE() {
  (await cookies()).delete('session')
  return NextResponse.json({ ok: true })
}
