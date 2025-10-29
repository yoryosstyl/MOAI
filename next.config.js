/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Trailing slash for better static hosting compatibility
  trailingSlash: true,
}

module.exports = nextConfig
