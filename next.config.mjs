/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  // Tree-shake lucide so only imported icons (ArrowLeft) enter the client graph.
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
