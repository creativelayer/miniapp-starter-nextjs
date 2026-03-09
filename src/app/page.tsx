'use client'

import { sdk } from '@farcaster/miniapp-sdk'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [fid, setFid] = useState<number | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('pending')
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<string | null>(null)

  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  useEffect(() => { setMounted(true) }, [])

  const attemptSignIn = useCallback(async () => {
    setAuthStatus('signing-in')
    try {
      const { token } = await sdk.quickAuth.getToken({
        quickAuthServerOrigin: process.env.NEXT_PUBLIC_QUICK_AUTH_ORIGIN,
      })
      setAuthToken(token)
      const payload = JSON.parse(atob(token.split('.')[1]))
      setAuthStatus(`authenticated:fid:${payload.sub}`)
    } catch {
      setAuthStatus('auth-failed')
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await sdk.actions.ready()
      const context = await sdk.context
      if (context) {
        setFid(context.user.fid)
        setDisplayName(context.user.displayName ?? null)
      }
      await attemptSignIn()
    }
    init()
  }, [attemptSignIn])

  const callApi = async () => {
    if (!authToken) return
    try {
      const res = await fetch('/api/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: displayName || 'anon' }),
      })
      const data = await res.json()
      if (res.ok) {
        setApiResponse(data.message)
      } else {
        setApiResponse(`Error: ${data.error}`)
      }
    } catch {
      setApiResponse('Error: request failed')
    }
  }

  return (
    <main className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mb-6">Farcaster Mini App</h1>

      <section className="mb-6 space-y-1">
        <div data-testid="fid">{fid ? `fid:${fid}` : ''}</div>
        <div data-testid="display-name">{displayName || ''}</div>
        <div data-testid="auth-status">{authStatus}</div>
      </section>

      <section className="mb-6 space-y-2">
        <h2 className="text-lg font-semibold">Wallet</h2>
        {mounted && isConnected ? (
          <div data-testid="wallet-address">{address}</div>
        ) : mounted ? (
          <button
            data-testid="connect-button"
            onClick={() => connect({ connector: connectors[0] })}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Connect
          </button>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">API Demo</h2>
        <button
          data-testid="call-api"
          onClick={callApi}
          disabled={!authToken}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Call /api/hello
        </button>
        {apiResponse && (
          <div data-testid="api-response">{apiResponse}</div>
        )}
      </section>
    </main>
  )
}
