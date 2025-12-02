import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: '/SDP_team_52_demo_test', 
  assetPrefix: '/SDP_team_52_demo_test/', 
}

export default nextConfig
