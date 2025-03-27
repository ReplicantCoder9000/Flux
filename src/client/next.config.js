/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: [
      'replicate.delivery',
      'images.unsplash.com'
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig