/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/explore?filter=evaluated",
        permanent: false,
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: "/api/data/:match*",
        destination: "https://testnet.hypercerts.org/_vercel/insights/:match*",
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
