/** @type {import('next').NextConfig} */
const nextConfig = {output: 'export', // Enable static export
  // Optional: Set base path for GitHub Pages (e.g., repo name)
  basePath: process.env.NODE_ENV === 'production' ? '/Mini-games' : '',
  // Optional: Add asset prefixes if needed
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Mini-games/' : '',};

export default nextConfig;
