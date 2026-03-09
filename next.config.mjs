/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_QUICK_AUTH_ORIGIN:
      process.env.NEXT_PUBLIC_QUICK_AUTH_ORIGIN || 'https://auth.farcaster.xyz',
  },
}

export default nextConfig
