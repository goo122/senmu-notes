# 森木笔记

温暖极简风格的个人博客（Astro + Markdown）。

## 开发

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（如 `http://127.0.0.1:4321`）。

```bash
npm run build    # 产出 dist/
npm run preview  # 预览构建结果
```

## 写文章

### 方式 A：直接编辑 Markdown

在 `src/content/posts/` 新建 `.md` 文件，例如：

```md
---
title: 标题
description: 摘要
pubDate: 2026-07-17
tags: [标签]
category: tech   # tech | life | notes | other
featured: false
draft: false
---

正文…
```

### 方式 B：Decap CMS 后台

1. 终端 A：`npx decap-server`
2. 终端 B：`npm run dev`
3. 打开：`http://127.0.0.1:4321/admin/`

生产部署请配置 Git Gateway / GitHub backend，并在 `public/admin/config.yml` 关闭 `local_backend`。

## 个性化

| 配置 | 文件 |
|------|------|
| 站名、作者、社交、友链、评论 | `src/lib/site.ts` |
| 设计 token | `src/styles/tokens.css` |
| 导航 | `src/lib/site.ts` → `nav` |

### 开启 Giscus 评论

1. https://giscus.app/zh-CN 配置仓库  
2. 在 `site.giscus` 填入 `enabled: true` 与 repo / id  

## 主要路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/blog` | 文章列表（分页） |
| `/blog/page/2` | 第 2 页 |
| `/blog/[slug]` | 文章详情 |
| `/tags`、`/categories/*` | 标签 / 分类 |
| `/archive` | 年份归档 |
| `/search` | 搜索（快捷键 `/`） |
| `/friends` | 友链 |
| `/rss.xml` | RSS |
| `/og/[slug]` | 动态 OG 图 |
| `/admin/` | CMS 后台 |

## 技术栈

Astro 5 · Content Collections · 原生 CSS · 静态输出
