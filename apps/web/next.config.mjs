/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Compiles the workspace packages inside the APP's own module graph instead
   * of consuming their prebuilt output as an opaque dependency. Without this,
   * `client` pulls its own copy of @tanstack/react-query and the shared hooks
   * end up reading a different React context than the provider the app renders
   * — every screen fails at prerender with "No QueryClient set".
   */
  transpilePackages: ['client', 'ui'],
}

export default nextConfig
