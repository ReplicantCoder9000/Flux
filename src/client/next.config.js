/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'replicate.delivery',
      'images.unsplash.com'
    ],
  },
}

module.exports = nextConfig