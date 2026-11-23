import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protège les routes choisies en redirigeant vers le login sans cookie de session.
export function proxy(request: NextRequest) {
  if (request.cookies.get('session')?.value) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/drops/:path*', '/profile/:path*', '/'],
}
