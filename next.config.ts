import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['pdf-parse', 'unpdf', 'better-sqlite3'],
};

export default nextConfig;