/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { cpus: 2, instrumentationHook: true },
};

export default nextConfig;
