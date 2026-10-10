/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [360, 390, 430, 640, 828, 1080, 1600] },
};

export default nextConfig;
