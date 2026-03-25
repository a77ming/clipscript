/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public repo default: server build. Use EXPORT_STATIC=true only for static packaging flows.
  output: process.env.EXPORT_STATIC === 'true' ? 'export' : 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // 图片优化配置（静态导出需要）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
