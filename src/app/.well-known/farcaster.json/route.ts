import { NextResponse } from 'next/server'
import { getFarcasterManifest } from '@/lib/manifest'

export async function GET() {
  return NextResponse.json(getFarcasterManifest())
}
