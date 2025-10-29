/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support dynamic routes with user-generated content
  // Static export doesn't work well with dynamic project pages
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
