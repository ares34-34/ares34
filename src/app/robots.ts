import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/onboarding/',
        '/settings/',
        '/change-password/',
        '/calendar/',
        '/compliance/',
        '/brief/',
        '/scenarios/',
        '/pulse/',
        '/prep/',
      ],
    },
    sitemap: 'https://ares34.com/sitemap.xml',
  }
}
