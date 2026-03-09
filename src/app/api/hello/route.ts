import { NextResponse } from 'next/server'
import { createClient } from '@farcaster/quick-auth'

const quickAuth = createClient({
  origin: process.env.NEXT_PUBLIC_QUICK_AUTH_ORIGIN || 'https://auth.farcaster.xyz',
})

export async function POST(request: Request) {
  const authorization = request.headers.get('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const token = authorization.slice(7)
  const domain = request.headers.get('x-forwarded-host') || new URL(request.url).host

  try {
    await quickAuth.verifyJwt({ token, domain })
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const name = body?.name || 'world'

  return NextResponse.json({ message: `Hello, ${name}!` })
}
