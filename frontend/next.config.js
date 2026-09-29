/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    const api = process.env.API_PROXY_TARGET || "https://madrasatulhabibielmustwafa-api.onrender.com";
    return [
      {
        source: "/api/:path*",
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
