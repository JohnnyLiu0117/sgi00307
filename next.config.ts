import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'john-liu-edu.sgi00307.chatgpt.site' }] },
  async rewrites() { return [{source:'/media/:path*',destination:'https://john-liu-edu.sgi00307.chatgpt.site/media/:path*'},{source:'/images/:path*',destination:'https://john-liu-edu.sgi00307.chatgpt.site/images/:path*'}]; },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' }
    ] }, { source: '/organizer/:path*', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'private, no-store' }] }];
  }
};
export default config;

