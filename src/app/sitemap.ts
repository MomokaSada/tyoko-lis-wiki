import type { MetadataRoute } from 'next';
import { getPublishedContentList } from '@/server/services/contentService';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tyokore.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/posts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/guide/markdown`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let postPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedContentList();
    postPages = posts.map((post) => ({
      url: `${BASE_URL}/posts/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt instanceof Date ? post.updatedAt : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // データベース取得に失敗した場合は、静的なページのみを返す
  }

  return [...staticPages, ...postPages];
}
