# 个人博客（森木笔记）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Astro + Markdown 搭建温暖极简风格的个人博客静态站，包含首页、文章列表/详情、关于、标签页与示例内容。

**Architecture:** Astro 静态站点；文章经 Content Collections 校验与查询；`BaseLayout` 提供导航/页脚/SEO；页面从 `getCollection('posts')` 过滤 draft、排序并渲染。样式用 CSS 设计 token，无后端。

**Tech Stack:** Astro 5.x、Markdown Content Collections、原生 CSS（tokens + global + prose）、TypeScript（Astro 默认）

**Spec:** `docs/superpowers/specs/2026-07-17-personal-blog-design.md`

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `package.json` | 脚本与依赖 |
| `astro.config.mjs` | Astro 配置 |
| `tsconfig.json` | TS 配置 |
| `src/content/config.ts` | posts collection schema |
| `src/content/posts/*.md` | 示例文章 |
| `src/styles/tokens.css` | 设计 token |
| `src/styles/global.css` | 全局与布局基础 |
| `src/styles/prose.css` | 文章正文排版 |
| `src/lib/posts.ts` | 查询辅助：published、tags、neighbors |
| `src/lib/site.ts` | 站名、作者、社交等站点配置 |
| `src/components/Header.astro` | 顶栏导航 |
| `src/components/Footer.astro` | 页脚 |
| `src/components/PostCard.astro` | 文章卡片 |
| `src/components/TagPill.astro` | 标签胶囊 |
| `src/components/CategoryBadge.astro` | 分类色标 |
| `src/components/PostMeta.astro` | 详情 meta |
| `src/components/PostNav.astro` | 上下篇 |
| `src/layouts/BaseLayout.astro` | 页面壳 + SEO |
| `src/pages/index.astro` | 首页 |
| `src/pages/blog/index.astro` | 文章列表 |
| `src/pages/blog/[...slug].astro` | 文章详情 |
| `src/pages/about.astro` | 关于 |
| `src/pages/tags/index.astro` | 标签索引 |
| `src/pages/tags/[tag].astro` | 单标签列表 |
| `src/pages/404.astro` | 404 |
| `public/favicon.svg` | 站点图标 |
| `public/avatar.svg` | 占位头像 |

---

### Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`
- Modify: `.gitignore` (ensure Astro defaults)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "senmu-notes",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'never',
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create src/env.d.ts**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 5: Update .gitignore**

Ensure these lines exist (merge with existing):

```
.superpowers/
node_modules/
dist/
.astro/
.env
.env.*
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: `node_modules/astro` exists; no error.

- [ ] **Step 7: Placeholder page so dev boots**

Create `src/pages/index.astro`:

```astro
---
const title = '森木笔记';
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>脚手架就绪</p>
  </body>
</html>
```

- [ ] **Step 8: Verify build**

Run: `npm run build`

Expected: exit 0; `dist/` generated.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/pages/index.astro .gitignore
git commit -m "chore: scaffold Astro personal blog project"
```

---

### Task 2: Site config and design tokens

**Files:**
- Create: `src/lib/site.ts`, `src/styles/tokens.css`, `src/styles/global.css`, `public/favicon.svg`, `public/avatar.svg`

- [ ] **Step 1: Create site config**

`src/lib/site.ts`:

```ts
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
} as const;

export const nav = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
] as const;

export type Category = 'tech' | 'life' | 'notes' | 'other';

export const categoryLabels: Record<Category, string> = {
  tech: '技术',
  life: '生活',
  notes: '随想',
  other: '其他',
};
```

- [ ] **Step 2: Create tokens.css**

`src/styles/tokens.css`:

```css
:root {
  --bg: #fffdf9;
  --surface: #ffffff;
  --text: #1c1917;
  --muted: #78716c;
  --accent: #ea580c;
  --accent-hover: #c2410c;
  --soft: #fff7ed;
  --border: #ffedd5;
  --radius-card: 14px;
  --radius-pill: 999px;
  --shadow-soft: 0 4px 16px rgba(28, 25, 23, 0.05);
  --shadow-hover: 0 8px 24px rgba(28, 25, 23, 0.08);
  --font-sans: "DM Sans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --content-width: 680px;
  --page-width: 960px;
  --header-h: 64px;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-8: 3rem;
}
```

- [ ] **Step 3: Create global.css**

`src/styles/global.css`:

```css
@import "./tokens.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.15s ease;
}

a:hover {
  color: var(--accent-hover);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.container {
  width: min(100% - 2rem, var(--page-width));
  margin-inline: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 1.15rem;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  background: var(--accent-hover);
  color: #fff;
  box-shadow: var(--shadow-hover);
}

.btn-ghost {
  background: var(--soft);
  color: #9a3412;
  border-color: var(--border);
}

.btn-ghost:hover {
  color: #9a3412;
  box-shadow: var(--shadow-soft);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 var(--space-4);
  color: var(--text);
}

.empty-state {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-card);
}
```

- [ ] **Step 4: Create simple SVG assets**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#FFF7ED"/>
  <circle cx="16" cy="16" r="8" fill="#EA580C"/>
</svg>
```

`public/avatar.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDBA74"/>
      <stop offset="1" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#g)"/>
  <circle cx="64" cy="52" r="22" fill="#FFFDF9" fill-opacity="0.9"/>
  <ellipse cx="64" cy="98" rx="34" ry="24" fill="#FFFDF9" fill-opacity="0.9"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts src/styles/tokens.css src/styles/global.css public/favicon.svg public/avatar.svg
git commit -m "feat: add site config and warm-minimal design tokens"
```

---

### Task 3: Content collection schema and sample posts

**Files:**
- Create: `src/content/config.ts`, `src/content/posts/gentle-frontend-refactor.md`, `src/content/posts/rainy-desk-americano.md`, `src/content/posts/short-notes-on-reading.md`, `src/content/posts/weekend-garden.md`

- [ ] **Step 1: Create content config**

`src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['tech', 'life', 'notes', 'other']),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: Create sample post — tech (featured)**

`src/content/posts/gentle-frontend-refactor.md`:

```markdown
---
title: 一次温和的前端重构
description: 把复杂页面拆成可呼吸的组件，让改动不再提心吊胆。
pubDate: 2026-07-01
tags: [前端, 重构, 工程]
category: tech
featured: true
---

有些代码库不是一夜之间变乱的，而是每一次「先这样吧」堆出来的。

## 从哪里下手

先画一张依赖草图：哪些模块互相认识、谁在偷偷 import 谁。目标不是重写，而是**缩小爆炸半径**。

1. 找出变更最频繁的文件
2. 把展示与数据获取拆开
3. 用小步提交保住可回滚性

## 可呼吸的组件

组件不必追求极致抽象。如果一个文件读起来像一篇短文，结构往往就对了：输入清晰、副作用靠边、样式就近。

> 重构的成功标志，是下一次需求来时你不再害怕打开那个文件夹。

## 收尾

加几条冒烟路径，删掉「以防万一」的死代码。喝口水，合上电脑——温和，就够了。
```

- [ ] **Step 3: Create sample post — life**

`src/content/posts/rainy-desk-americano.md`:

```markdown
---
title: 雨天的书桌与一杯美式
description: 窗外下着雨，桌上放着冷却的咖啡，正好写一点与效率无关的文字。
pubDate: 2026-06-18
tags: [生活, 日常]
category: life
---

雨声把城市的噪声按了静音键。

美式见底之后，光标还在闪。这一刻不需要 KPI，只需要把句子写完整。博客存在的意义，或许就是留下这些「不重要但真实」的下午。
```

- [ ] **Step 4: Create sample post — notes**

`src/content/posts/short-notes-on-reading.md`:

```markdown
---
title: 读书短札：留白与节奏
description: 几条关于阅读节奏与笔记方法的碎想法。
pubDate: 2026-05-30
tags: [阅读, 笔记]
category: notes
---

- 一本好书不必读完才有价值；读到卡住的地方，本身就是收获。
- 笔记写给三个月后的自己，而不是写给考官。
- 留白不是懒，是给理解留进出的门。
```

- [ ] **Step 5: Create sample post — life/other multi-tag**

`src/content/posts/weekend-garden.md`:

```markdown
---
title: 周末的数字小花园
description: 照料一个小站点，像照料阳台盆栽一样让人安心。
pubDate: 2026-06-28
tags: [生活, 博客, 前端]
category: life
featured: true
---

浇水、修枝、换盆——网站也一样：改一行文案、调一点间距、删一篇过时草稿。

不需要一夜长成森林。持续出现的小嫩芽，就很好。
```

- [ ] **Step 6: Create posts helper**

`src/lib/posts.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const featured = posts.filter((p) => p.data.featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return posts.slice(0, limit);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.tags.includes(tag));
}

export async function getNeighborPosts(
  slug: string,
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  // posts are newest-first: "next" = older, "prev" = newer
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
```

- [ ] **Step 7: Verify content builds**

Run: `npm run build`

Expected: exit 0. If schema fails, fix frontmatter before continuing.

- [ ] **Step 8: Commit**

```bash
git add src/content src/lib/posts.ts
git commit -m "feat: add posts collection schema and sample articles"
```

---

### Task 4: Layout shell — Header, Footer, BaseLayout

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` (use layout temporarily)

- [ ] **Step 1: Header.astro**

```astro
---
import { site, nav } from '../lib/site';

interface Props {
  currentPath?: string;
}

const { currentPath = '/' } = Astro.props;

function isActive(href: string, path: string) {
  if (href === '/') return path === '/' || path === '';
  return path === href || path.startsWith(href + '/');
}
---

<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/">{site.name}</a>
    <nav class="nav" aria-label="主导航">
      {
        nav.map((item) => (
          <a
            href={item.href}
            class:list={['nav-link', { active: isActive(item.href, currentPath) }]}
            aria-current={isActive(item.href, currentPath) ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))
      }
    </nav>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    height: var(--header-h);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .header-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .logo {
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--text);
    letter-spacing: 0.02em;
  }

  .logo:hover {
    color: var(--accent);
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    justify-content: flex-end;
  }

  .nav-link {
    color: var(--muted);
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.25rem 0.35rem;
  }

  .nav-link:hover,
  .nav-link.active {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 2: Footer.astro**

```astro
---
import { site } from '../lib/site';
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container footer-inner">
    <p>© {year} {site.author} · {site.name}</p>
    <p class="footer-links">
      <a href={site.social.github} rel="noopener noreferrer" target="_blank">GitHub</a>
      <span aria-hidden="true">·</span>
      <a href={`mailto:${site.social.email}`}>邮箱</a>
    </p>
  </div>
</footer>

<style>
  .site-footer {
    margin-top: auto;
    border-top: 1px solid var(--border);
    padding: var(--space-6) 0;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: space-between;
    align-items: center;
  }

  .footer-links {
    display: flex;
    gap: 0.5rem;
    margin: 0;
  }

  .footer-links a {
    color: var(--muted);
  }

  .footer-links a:hover {
    color: var(--accent);
  }

  p {
    margin: 0;
  }
</style>
```

- [ ] **Step 3: BaseLayout.astro**

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { site } from '../lib/site';
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

const {
  title = site.title,
  description = site.description,
  image,
} = Astro.props;

const pageTitle = title === site.title ? title : `${title} · ${site.name}`;
const canonical = new URL(Astro.url.pathname, site.url).toString();
const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';
---

<!doctype html>
<html lang={site.lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
      rel="stylesheet"
    />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    {image && <meta property="og:image" content={new URL(image, site.url).toString()} />}
    <meta name="generator" content={Astro.generator} />
  </head>
  <body class="layout-body">
    <Header currentPath={currentPath} />
    <main class="site-main">
      <slot />
    </main>
    <Footer />
  </body>
</html>

<style>
  .layout-body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .site-main {
    flex: 1;
    padding: var(--space-6) 0 var(--space-8);
    animation: fade-in 0.35s ease both;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

- [ ] **Step 4: Wire placeholder index to layout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout>
  <div class="container">
    <h1>森木笔记</h1>
    <p>布局壳已就绪，内容页建设中。</p>
  </div>
</BaseLayout>
```

- [ ] **Step 5: Verify**

Run: `npm run build`

Expected: exit 0.

Run: `npm run dev` briefly and open `/` — expect nav + footer.

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add BaseLayout with header, footer, and SEO"
```

---

### Task 5: Shared UI components — cards, tags, prose

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/TagPill.astro`, `src/components/CategoryBadge.astro`, `src/components/PostMeta.astro`, `src/components/PostNav.astro`, `src/styles/prose.css`

- [ ] **Step 1: TagPill.astro**

```astro
---
interface Props {
  tag: string;
  count?: number;
}

const { tag, count } = Astro.props;
const href = `/tags/${encodeURIComponent(tag)}`;
---

<a class="tag-pill" href={href}>
  <span>#{tag}</span>
  {typeof count === 'number' && <span class="count">{count}</span>}
</a>

<style>
  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-pill);
    background: var(--soft);
    color: #9a3412;
    border: 1px solid var(--border);
    font-size: 0.85rem;
    font-weight: 500;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .tag-pill:hover {
    color: #9a3412;
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }

  .count {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
</style>
```

- [ ] **Step 2: CategoryBadge.astro**

```astro
---
import { categoryLabels, type Category } from '../lib/site';

interface Props {
  category: Category;
}

const { category } = Astro.props;
const label = categoryLabels[category];
---

<span class:list={['cat-badge', `cat-${category}`]}>{label}</span>

<style>
  .cat-badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .cat-life {
    color: #c2410c;
  }

  .cat-notes {
    color: #b45309;
  }

  .cat-other {
    color: #a8a29e;
  }
</style>
```

- [ ] **Step 3: PostCard.astro**

```astro
---
import type { Post } from '../lib/posts';
import CategoryBadge from './CategoryBadge.astro';
import TagPill from './TagPill.astro';

interface Props {
  post: Post;
}

const { post } = Astro.props;
const date = post.data.pubDate.toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
---

<article class="post-card">
  <a class="card-link" href={`/blog/${post.slug}`}>
    <div class="card-meta">
      <CategoryBadge category={post.data.category} />
      <time datetime={post.data.pubDate.toISOString()}>{date}</time>
    </div>
    <h3 class="card-title">{post.data.title}</h3>
    <p class="card-desc">{post.data.description}</p>
  </a>
  {
    post.data.tags.length > 0 && (
      <div class="card-tags">
        {post.data.tags.slice(0, 4).map((tag) => (
          <TagPill tag={tag} />
        ))}
      </div>
    )
  }
</article>

<style>
  .post-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: var(--space-5);
    box-shadow: var(--shadow-soft);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .post-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  .card-link {
    color: inherit;
    display: block;
  }

  .card-link:hover {
    color: inherit;
  }

  .card-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: var(--muted);
  }

  .card-title {
    margin: 0 0 0.4rem;
    font-size: 1.15rem;
    line-height: 1.35;
    color: var(--text);
  }

  .card-link:hover .card-title {
    color: var(--accent);
  }

  .card-desc {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: var(--space-4);
  }
</style>
```

- [ ] **Step 4: PostMeta.astro**

```astro
---
import type { Category } from '../lib/site';
import CategoryBadge from './CategoryBadge.astro';
import TagPill from './TagPill.astro';

interface Props {
  pubDate: Date;
  category: Category;
  tags: string[];
  updatedDate?: Date;
}

const { pubDate, category, tags, updatedDate } = Astro.props;
const published = pubDate.toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<div class="post-meta">
  <div class="row">
    <CategoryBadge category={category} />
    <time datetime={pubDate.toISOString()}>{published}</time>
    {
      updatedDate && (
        <span class="updated">
          更新于{' '}
          <time datetime={updatedDate.toISOString()}>
            {updatedDate.toLocaleDateString('zh-CN')}
          </time>
        </span>
      )
    }
  </div>
  {
    tags.length > 0 && (
      <div class="tags">
        {tags.map((tag) => (
          <TagPill tag={tag} />
        ))}
      </div>
    )
  }
</div>

<style>
  .post-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    color: var(--muted);
    font-size: 0.95rem;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
</style>
```

- [ ] **Step 5: PostNav.astro**

```astro
---
import type { Post } from '../lib/posts';

interface Props {
  prev: Post | null;
  next: Post | null;
}

const { prev, next } = Astro.props;
---

{
  (prev || next) && (
    <nav class="post-nav" aria-label="相邻文章">
      {prev ? (
        <a class="nav-item" href={`/blog/${prev.slug}`}>
          <span class="label">较新</span>
          <span class="title">{prev.data.title}</span>
        </a>
      ) : (
        <span class="nav-item empty" />
      )}
      {next ? (
        <a class="nav-item next" href={`/blog/${next.slug}`}>
          <span class="label">更早</span>
          <span class="title">{next.data.title}</span>
        </a>
      ) : (
        <span class="nav-item empty" />
      )}
    </nav>
  )
}

<style>
  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: var(--space-4);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    transition: box-shadow 0.15s ease, transform 0.15s ease;
  }

  .nav-item:hover {
    color: var(--text);
    box-shadow: var(--shadow-soft);
    transform: translateY(-1px);
  }

  .nav-item.next {
    text-align: right;
  }

  .nav-item.empty {
    border: none;
    background: transparent;
    pointer-events: none;
  }

  .label {
    font-size: 0.8rem;
    color: var(--muted);
  }

  .title {
    font-weight: 600;
    color: var(--accent);
  }

  @media (max-width: 560px) {
    .post-nav {
      grid-template-columns: 1fr;
    }

    .nav-item.next {
      text-align: left;
    }
  }
</style>
```

- [ ] **Step 6: prose.css**

`src/styles/prose.css`:

```css
.prose {
  max-width: var(--content-width);
  margin-inline: auto;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--text);
}

.prose :where(h2, h3, h4) {
  line-height: 1.3;
  margin-top: 2em;
  margin-bottom: 0.6em;
  color: var(--text);
}

.prose h2 {
  font-size: 1.45rem;
}

.prose h3 {
  font-size: 1.2rem;
}

.prose p {
  margin: 0 0 1.15em;
}

.prose a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose ul,
.prose ol {
  margin: 0 0 1.15em;
  padding-left: 1.35em;
}

.prose li {
  margin-bottom: 0.35em;
}

.prose blockquote {
  margin: 0 0 1.15em;
  padding: 0.75rem 1rem;
  border-left: 3px solid var(--accent);
  background: var(--soft);
  border-radius: 0 var(--radius-card) var(--radius-card) 0;
  color: #57534e;
}

.prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  background: var(--soft);
  padding: 0.15em 0.4em;
  border-radius: 6px;
}

.prose pre {
  padding: 1rem 1.1rem;
  overflow-x: auto;
  border-radius: var(--radius-card);
  background: #1c1917;
  color: #fafaf9;
  margin: 0 0 1.25em;
}

.prose pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.prose hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2em 0;
}

.prose img {
  border-radius: var(--radius-card);
  margin: 1.25em auto;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/PostCard.astro src/components/TagPill.astro src/components/CategoryBadge.astro src/components/PostMeta.astro src/components/PostNav.astro src/styles/prose.css
git commit -m "feat: add post UI components and prose styles"
```

---

### Task 6: Blog list and detail pages

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`
- Modify: none required beyond create

- [ ] **Step 1: Blog index**

`src/pages/blog/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getPublishedPosts } from '../../lib/posts';
import { site } from '../../lib/site';

const posts = await getPublishedPosts();
---

<BaseLayout title="文章" description={`全部文章 — ${site.name}`}>
  <div class="container">
    <header class="page-header">
      <h1>文章</h1>
      <p class="lead">技术、生活与随想，按时间倒序排列。</p>
    </header>
    {
      posts.length === 0 ? (
        <p class="empty-state">暂无文章</p>
      ) : (
        <div class="post-list">
          {posts.map((post) => (
            <PostCard post={post} />
          ))}
        </div>
      )
    }
  </div>
</BaseLayout>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }

  .page-header h1 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
  }

  .lead {
    margin: 0;
    color: var(--muted);
  }

  .post-list {
    display: grid;
    gap: var(--space-4);
  }
</style>
```

- [ ] **Step 2: Blog detail**

`src/pages/blog/[...slug].astro`:

```astro
---
import { type CollectionEntry, getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostMeta from '../../components/PostMeta.astro';
import PostNav from '../../components/PostNav.astro';
import { getNeighborPosts } from '../../lib/posts';
import '../../styles/prose.css';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props {
  post: CollectionEntry<'posts'>;
}

const { post } = Astro.props;
const { Content } = await post.render();
const { prev, next } = await getNeighborPosts(post.slug);
---

<BaseLayout
  title={post.data.title}
  description={post.data.description}
  image={post.data.heroImage}
>
  <article class="container article">
    <header class="article-header">
      <h1>{post.data.title}</h1>
      <PostMeta
        pubDate={post.data.pubDate}
        category={post.data.category}
        tags={post.data.tags}
        updatedDate={post.data.updatedDate}
      />
    </header>
    <div class="prose">
      <Content />
    </div>
    <PostNav prev={prev} next={next} />
  </article>
</BaseLayout>

<style>
  .article-header h1 {
    margin: 0 0 var(--space-4);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    line-height: 1.25;
    max-width: var(--content-width);
  }

  .article :global(.post-meta),
  .article :global(.post-nav) {
    max-width: var(--content-width);
  }
</style>
```

- [ ] **Step 3: Verify routes**

Run: `npm run build`

Expected: exit 0; `dist/blog/index.html` and per-post HTML exist.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog
git commit -m "feat: add blog list and post detail pages"
```

---

### Task 7: Home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Implement home page**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import { getFeaturedPosts, getPublishedPosts } from '../lib/posts';
import { site, categoryLabels, type Category } from '../lib/site';

const featured = await getFeaturedPosts(3);
const latest = (await getPublishedPosts()).slice(0, 4);
const categories = Object.entries(categoryLabels) as [Category, string][];
---

<BaseLayout>
  <div class="container">
    <section class="hero">
      <img class="avatar" src="/avatar.svg" alt={`${site.author} 的头像`} width="88" height="88" />
      <div class="hero-copy">
        <h1>你好，我是{site.author} 👋</h1>
        <p class="tagline">{site.description}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/blog">阅读文章</a>
          <a class="btn btn-ghost" href="/about">关于我</a>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <h2 class="section-title">精选文章</h2>
        <a class="more" href="/blog">全部文章 →</a>
      </div>
      <div class="post-list">
        {featured.map((post) => <PostCard post={post} />)}
      </div>
    </section>

    <section class="block">
      <h2 class="section-title">逛逛分类</h2>
      <div class="cat-grid">
        {
          categories.map(([key, label]) => (
            <a class="cat-card" href={`/blog#${key}`}>
              <span class="cat-name">{label}</span>
              <span class="cat-key">{key}</span>
            </a>
          ))
        }
      </div>
    </section>

    {
      latest.length > 0 && (
        <section class="block">
          <h2 class="section-title">最新更新</h2>
          <ul class="latest-list">
            {latest.map((post) => (
              <li>
                <time datetime={post.data.pubDate.toISOString()}>
                  {post.data.pubDate.toLocaleDateString('zh-CN')}
                </time>
                <a href={`/blog/${post.slug}`}>{post.data.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )
    }
  </div>
</BaseLayout>

<style>
  .hero {
    display: flex;
    gap: var(--space-5);
    align-items: center;
    padding: var(--space-6) 0 var(--space-8);
  }

  .avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(234, 88, 12, 0.22);
    flex-shrink: 0;
  }

  .hero-copy h1 {
    margin: 0 0 0.5rem;
    font-size: clamp(1.6rem, 3.5vw, 2rem);
  }

  .tagline {
    margin: 0 0 var(--space-4);
    color: var(--muted);
    max-width: 36rem;
    line-height: 1.65;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .block {
    margin-bottom: var(--space-8);
  }

  .block-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .block-head .section-title {
    margin: 0;
  }

  .more {
    font-size: 0.95rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .post-list {
    display: grid;
    gap: var(--space-4);
  }

  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3);
  }

  .cat-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: var(--space-4);
    border-radius: var(--radius-card);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--shadow-soft);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .cat-card:hover {
    color: var(--text);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  .cat-name {
    font-weight: 700;
  }

  .cat-key {
    font-size: 0.8rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .latest-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    background: var(--surface);
    overflow: hidden;
  }

  .latest-list li {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid var(--border);
  }

  .latest-list li:last-child {
    border-bottom: none;
  }

  .latest-list time {
    color: var(--muted);
    font-size: 0.9rem;
    min-width: 6.5rem;
  }

  .latest-list a {
    color: var(--text);
    font-weight: 600;
  }

  .latest-list a:hover {
    color: var(--accent);
  }

  @media (max-width: 560px) {
    .hero {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
```

Note: Category cards link to `/blog` for browsing; first version does not require separate category routes (per spec).

- [ ] **Step 2: Verify**

Run: `npm run build`

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build warm-minimal home page with hero and posts"
```

---

### Task 8: Tags, About, 404

**Files:**
- Create: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`, `src/pages/about.astro`, `src/pages/404.astro`

- [ ] **Step 1: Tags index**

`src/pages/tags/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TagPill from '../../components/TagPill.astro';
import { getAllTags } from '../../lib/posts';
import { site } from '../../lib/site';

const tags = await getAllTags();
---

<BaseLayout title="标签" description={`全部标签 — ${site.name}`}>
  <div class="container">
    <header class="page-header">
      <h1>标签</h1>
      <p class="lead">按主题浏览文章。</p>
    </header>
    {
      tags.length === 0 ? (
        <p class="empty-state">暂无标签</p>
      ) : (
        <div class="tag-cloud">
          {tags.map(({ tag, count }) => (
            <TagPill tag={tag} count={count} />
          ))}
        </div>
      )
    }
  </div>
</BaseLayout>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }

  .page-header h1 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
  }

  .lead {
    margin: 0;
    color: var(--muted);
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }
</style>
```

- [ ] **Step 2: Tag detail**

`src/pages/tags/[tag].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getAllTags, getPostsByTag } from '../../lib/posts';
import { site } from '../../lib/site';

export async function getStaticPaths() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({
    params: { tag },
  }));
}

const { tag } = Astro.params;
const decoded = decodeURIComponent(tag!);
const posts = await getPostsByTag(decoded);
---

<BaseLayout title={`#${decoded}`} description={`标签 ${decoded} 下的文章 — ${site.name}`}>
  <div class="container">
    <header class="page-header">
      <p class="eyebrow"><a href="/tags">← 全部标签</a></p>
      <h1>#{decoded}</h1>
      <p class="lead">{posts.length} 篇文章</p>
    </header>
    {
      posts.length === 0 ? (
        <p class="empty-state">暂无文章</p>
      ) : (
        <div class="post-list">
          {posts.map((post) => (
            <PostCard post={post} />
          ))}
        </div>
      )
    }
  </div>
</BaseLayout>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
  }

  .page-header h1 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
  }

  .lead {
    margin: 0;
    color: var(--muted);
  }

  .post-list {
    display: grid;
    gap: var(--space-4);
  }
</style>
```

- [ ] **Step 3: About page**

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../lib/site';
---

<BaseLayout title="关于我" description={`关于 ${site.author} — ${site.name}`}>
  <div class="container about">
    <header class="page-header">
      <img class="avatar" src="/avatar.svg" alt="" width="96" height="96" />
      <div>
        <h1>关于 {site.author}</h1>
        <p class="lead">技术与生活交叠的记录者。</p>
      </div>
    </header>

    <div class="prose-lite">
      <p>
        你好，我是{site.author}。这里是我的数字小花园：会写一点工程笔记，也会留下日常与随想。
        站点名「{site.name}」取温暖、生长之意——内容慢慢长，不必赶工期。
      </p>
      <p>目前主要关注：</p>
      <ul>
        <li>前端工程与可读代码</li>
        <li>生活里的小确幸与节奏</li>
        <li>阅读与笔记方法</li>
      </ul>
      <p>
        想聊聊？欢迎通过
        <a href={site.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        或
        <a href={`mailto:${site.social.email}`}>邮箱</a>
        找到我。站点配置集中在 <code>src/lib/site.ts</code>，换成你的信息即可。
      </p>
    </div>
  </div>
</BaseLayout>

<style>
  .about {
    max-width: var(--content-width);
  }

  .page-header {
    display: flex;
    gap: var(--space-5);
    align-items: center;
    margin-bottom: var(--space-6);
  }

  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(234, 88, 12, 0.2);
  }

  .page-header h1 {
    margin: 0 0 0.35rem;
    font-size: 2rem;
  }

  .lead {
    margin: 0;
    color: var(--muted);
  }

  .prose-lite {
    line-height: 1.75;
    color: var(--text);
  }

  .prose-lite p {
    margin: 0 0 1.1em;
  }

  .prose-lite ul {
    margin: 0 0 1.1em;
    padding-left: 1.25em;
  }

  .prose-lite code {
    font-size: 0.9em;
    background: var(--soft);
    padding: 0.1em 0.35em;
    border-radius: 6px;
  }

  @media (max-width: 560px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
```

- [ ] **Step 4: 404 page**

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="页面不存在" description="找不到这个页面">
  <div class="container not-found">
    <p class="code">404</p>
    <h1>这里空空如也</h1>
    <p class="lead">链接可能写错了，或内容已经搬走。</p>
    <div class="actions">
      <a class="btn btn-primary" href="/">回首页</a>
      <a class="btn btn-ghost" href="/blog">看文章</a>
    </div>
  </div>
</BaseLayout>

<style>
  .not-found {
    text-align: center;
    padding: var(--space-8) 0;
  }

  .code {
    margin: 0;
    font-size: 4rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }

  h1 {
    margin: 0.5rem 0;
    font-size: 1.75rem;
  }

  .lead {
    margin: 0 0 var(--space-5);
    color: var(--muted);
  }

  .actions {
    display: flex;
    gap: 0.65rem;
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
```

- [ ] **Step 5: Verify**

Run: `npm run build`

Expected: exit 0; tag pages generated for 前端, 生活, etc.

- [ ] **Step 6: Commit**

```bash
git add src/pages/tags src/pages/about.astro src/pages/404.astro
git commit -m "feat: add tags, about, and 404 pages"
```

---

### Task 9: Polish, draft behavior, acceptance

**Files:**
- Create: `src/content/posts/_draft-example.md` (optional draft for manual check)
- Modify: any CSS polish if visual issues appear during QA

- [ ] **Step 1: Add a draft post (dev-only visibility)**

`src/content/posts/secret-wip.md`:

```markdown
---
title: （草稿）尚未公开的想法
description: 用于验证 draft 过滤，生产环境不应出现。
pubDate: 2026-07-10
tags: [草稿]
category: notes
draft: true
---

这篇只应在开发模式列表中可见。
```

- [ ] **Step 2: Production build must exclude draft**

Run: `npm run build`

Then search dist:

```bash
# PowerShell
Select-String -Path dist/**/*.html -Pattern "尚未公开" -SimpleMatch
```

Expected: no matches (or only none).

- [ ] **Step 3: Manual acceptance checklist**

With `npm run dev` or `npm run preview`:

- [ ] `/` Hero、精选、分类、最新正常
- [ ] `/blog` 四篇已发布（不含草稿）时间倒序
- [ ] 任选 `/blog/<slug>` 正文、标签、上下篇正常
- [ ] `/tags` 与某个 `/tags/<tag>` 正常
- [ ] `/about` 文案与链接正常
- [ ] 缩窄窗口到 ~375px：导航不溢出、卡片可读
- [ ] 视觉：暖白底、橙色强调、圆角卡片

- [ ] **Step 4: Final build**

Run: `npm run build`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/content/posts/secret-wip.md
git commit -m "chore: add draft sample and complete acceptance pass"
```

---

## Self-Review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Astro + Markdown Content Collections | 1, 3 |
| Warm minimal tokens / 圆角 / hover | 2, 5 |
| Routes: `/`, `/blog`, `/blog/[slug]`, `/about`, `/tags`, `/tags/[tag]` | 6–8 |
| Frontmatter schema fields | 3 |
| draft filtering in PROD | 3 (`getPublishedPosts`), 6, 9 |
| Components: layout, card, tags, prose, meta, nav | 4, 5 |
| ≥3 samples tech/life/notes | 3 (4 published + 1 draft) |
| SEO title/description/OG basics | 4 BaseLayout |
| 404 | 8 |
| No search/CMS/comments | not in plan |
| `npm run build` success | each task + 9 |

**Placeholder scan:** none intentional.  
**Type consistency:** `Category`, `Post`, frontmatter fields aligned across `site.ts`, `config.ts`, components.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-17-personal-blog.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration  
2. **Inline Execution** — execute tasks in this session with executing-plans, batch checkpoints  

Which approach?
