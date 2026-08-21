/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Compiles `ui` inside the APP's own module graph instead of consuming a
   * prebuilt output as an opaque dependency. Without this, `ui` pulls its own
   * copy of @tanstack/react-query and the shared hooks end up reading a
   * different React context than the provider the app renders — every screen
   * fails at prerender with "No QueryClient set".
   */
  transpilePackages: ['ui'],
}

export default nextConfig
