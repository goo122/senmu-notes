import type { APIRoute } from 'astro';
import { getPublishedPosts, getAllTags, getCategoryCounts } from '../lib/posts';
import { site } from '../lib/site';

export const GET: APIRoute = async ({ site: siteUrl }) => {
  const base = (siteUrl?.origin ?? site.url).replace(/\/$/, '');
  const posts = await getPublishedPosts();
  const tags = await getAllTags();
  const categories = await getCategoryCounts();

  const staticPaths = ['/', '/blog', '/tags', '/about', '/search', '/archive'];
  const urls: { loc: string; lastmod?: string }[] = [
    ...staticPaths.map((p) => ({ loc: `${base}${p === '/' ? '' : p}` })),
    ...posts.map((p) => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: (p.data.updatedDate ?? p.data.pubDate).toISOString(),
    })),
    ...tags.map((t) => ({
      loc: `${base}/tags/${encodeURIComponent(t.tag)}`,
    })),
    ...categories.map((c) => ({
      loc: `${base}/categories/${c.category}`,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
