/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  async headers() {
    return [{ source: "/assets/:event/media/:file", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }, { source: "/assets/:event/share/:file", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [360, 390, 430, 640, 828, 1080, 1600] },
};

export default nextConfig;
