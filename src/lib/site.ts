export const site = {
  name: '森木笔记',
  title: '森木笔记 — 技术 · 生活 · 随想',
  description: '写技术、记生活、留一些偶尔闪光的念头。',
  author: '小木',
  lang: 'zh-CN',
  url: 'https://example.com',
  social: {
    github: 'https://github.com/',
    email: 'hello@example.com',
  },
  /**
   * Giscus 评论：在 https://giscus.app/zh-CN 配置后填入。
   * 全部字段填好后评论区才会显示。
   */
  giscus: {
    enabled: false,
    repo: 'OWNER/REPO',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
    mapping: 'pathname' as const,
    reactionsEnabled: true,
    inputPosition: 'top' as const,
    lang: 'zh-CN',
  },
} as const;

export const nav = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章' },
  { href: '/archive', label: '归档' },
  { href: '/tags', label: '标签' },
  { href: '/search', label: '搜索' },
  { href: '/about', label: '关于' },
] as const;

export type Category = 'tech' | 'life' | 'notes' | 'other';

export const categoryLabels: Record<Category, string> = {
  tech: '技术',
  life: '生活',
  notes: '随想',
  other: '其他',
};

export function isGiscusReady(): boolean {
  const g = site.giscus;
  return Boolean(
    g.enabled && g.repo && g.repoId && g.categoryId && !g.repo.includes('OWNER'),
  );
}
