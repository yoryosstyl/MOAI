/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // trailingSlash: false, // Removed - was causing 404s on routes
}

module.exports = nextConfig
