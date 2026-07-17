import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../../lib/site';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return [
    { params: { slug: 'default' } },
    ...posts.map((post) => ({ params: { slug: post.slug } })),
  ];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapTitle(title: string, maxLen = 28): string[] {
  const chars = [...title];
  if (chars.length <= maxLen) return [title];
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    if (line.length >= maxLen) {
      lines.push(line);
      line = ch;
      if (lines.length >= 3) break;
    } else {
      line += ch;
    }
  }
  if (line && lines.length < 3) lines.push(line);
  if (chars.length > maxLen * 3) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.slice(0, Math.max(0, last.length - 1)) + '…';
  }
  return lines;
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? 'default';
  let title = site.title;
  let subtitle = site.name;

  if (slug !== 'default') {
    const posts = await getCollection('posts');
    const post = posts.find((p) => p.slug === slug);
    if (post) {
      title = post.data.title;
      subtitle = `${site.name} · ${post.data.category}`;
    }
  }

  const lines = wrapTitle(title, 18);
  const startY = 200 - ((lines.length - 1) * 28) / 2;

  const textLines = lines
    .map(
      (line, i) =>
        `<text x="80" y="${startY + i * 52}" fill="#1c1917" font-size="44" font-weight="700" font-family="system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif">${escapeXml(line)}</text>`,
    )
    .join('\n  ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFDF9"/>
      <stop offset="1" stop-color="#FFF7ED"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="80" r="160" fill="#FDBA74" fill-opacity="0.35"/>
  <circle cx="100" cy="560" r="120" fill="#EA580C" fill-opacity="0.12"/>
  <rect x="80" y="72" width="64" height="64" rx="16" fill="#EA580C"/>
  <circle cx="112" cy="104" r="16" fill="#FFF7ED"/>
  <text x="164" y="116" fill="#EA580C" font-size="28" font-weight="700" font-family="system-ui, sans-serif">${escapeXml(site.name)}</text>
  ${textLines}
  <text x="80" y="520" fill="#78716C" font-size="28" font-family="system-ui, 'PingFang SC', sans-serif">${escapeXml(subtitle)}</text>
  <rect x="80" y="560" width="120" height="6" rx="3" fill="#EA580C"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
