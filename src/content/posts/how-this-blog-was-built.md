---
title: 这个博客是怎么搭建的
description: 从零开始用 Astro + Markdown 搭「森木笔记」：技术选型、目录结构、核心功能与如何发文。
pubDate: 2026-07-17
tags: [博客, Astro, 前端, 教程]
category: tech
featured: true
---

「森木笔记」是一个**展示优先**的个人博客：页面要好看，文章用 Markdown 管理，以后也可以在网页后台发文。下面按真实搭建过程，把选型、结构和用法说清楚。

## 我们想做什么

一开始需求很简单：

- 综合型内容：技术、生活、随想都能写
- 第一版先**漂亮地展示**，写作方式可以后定
- 要有完整基础站：首页、列表、详情、关于、标签
- 视觉走**温暖极简**：暖白底、橙色强调、圆角卡片

明确**先不做**的：复杂后台、评论强依赖、多语言（评论和 CMS 后来做成可选项）。

## 技术选型：为什么是 Astro

对比过三条路：

| 方案 | 适合 | 代价 |
|------|------|------|
| **Astro + Markdown** | 博客、静态站、SEO | 后台要另接 CMS |
| Next.js + MDX | 重度 React 交互 | 对纯博客略重 |
| 纯 Vite 单页 | 极速出视觉 | 文章多了难维护 |

最终选了 **Astro**：

1. 天生适合内容站，构建结果是静态 HTML，部署简单
2. Content Collections 能校验文章字段，出错在构建期就暴露
3. 样式自由度高，温暖极简很好落地
4. 以后接 Decap CMS 不需要推倒重来

当前栈可以概括为：

```text
Astro 5  ·  Markdown Content Collections  ·  原生 CSS Token
可选：Decap CMS（网页发文） · Giscus（评论，需配置）
```

## 项目长什么样

核心目录（简化版）：

```text
src/
  content/
    config.ts          # 文章 schema
    posts/*.md         # 每一篇文章
  pages/               # 路由：首页、blog、tags、about…
  components/          # 卡片、导航、主题切换…
  layouts/             # BaseLayout
  lib/                 # 站点配置、文章查询、分页
  styles/              # tokens / global / prose
public/
  editor.html          # 网页发文后台入口
  admin/config.yml     # CMS 配置
  uploads/             # 上传图片
```

文章用 **frontmatter + 正文** 描述，例如：

```yaml
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-07-17
tags: [博客, Astro]
category: tech          # tech | life | notes | other
featured: true          # 是否首页精选
draft: false            # true 时生产构建不展示
---

正文从这里开始，支持 Markdown。
```

生产环境会过滤 `draft: true` 的文章；本地 `astro dev` 仍可预览草稿。

## 页面与功能地图

第一版就把基础站铺齐，后来又迭代了体验向功能：

### 基础

- **首页**：介绍、精选、分类入口、最新列表
- **文章列表** `/blog`：时间倒序，带分页
- **文章详情**：阅读排版、标签、上下篇、目录
- **标签 / 分类 / 归档 / 关于**
- **404** 与基础 SEO（title、description、OG）

### 体验增强

- 深色 / 浅色主题（记住你的选择）
- 全文搜索（快捷键 `/`）
- 阅读时长、阅读进度条、相关文章
- 复制链接 / 分享、代码块一键复制
- 友链、RSS、sitemap、动态 OG 图
- View Transitions + 链接预取（站内切换更顺）

### 发文方式

1. **手写 Markdown**：在 `src/content/posts/` 新建 `.md`
2. **网页后台**：运行 `npm run write`，打开 `/editor.html`（Decap CMS + 本地代理）

站点名、作者、社交链接集中在 `src/lib/site.ts`，改一处全局生效。

## 视觉：温暖极简怎么落地

没有上重型 UI 库，而是用 **CSS 变量（design tokens）** 统一风格：

- 背景 `#FFFDF9`、强调色 `#EA580C`
- 大圆角卡片、胶囊按钮、柔和阴影
- 正文约 17–18px、行高 1.75、阅读宽约 680px
- 暗色模式通过 `html.dark` 切换同一套 token

这样换肤、改品牌色都很直接，也不会被组件库风格绑架。

## 本地怎么跑

在项目目录：

```bash
npm install
npm run dev      # 开发预览
npm run build    # 生产构建 → dist/
npm run write    # 博客 + 网页发文后台一起开
```

预览地址以终端打印为准。网页发文请打开：

```text
http://127.0.0.1:端口/editor.html
```

并确认 CMS 代理在 **8081** 端口监听。

## 部署思路

`npm run build` 之后，`dist/` 是纯静态站点，可以丢到：

- Vercel / Netlify / Cloudflare Pages
- GitHub Pages
- 任意静态文件托管

公网若要用**网页后台发文**，需要把 Decap 配成 GitHub 或 Netlify Identity 后端（本地 `local_backend` 只适合开发机）。

## 搭建时踩过的坑（简记）

1. **`trailingSlash: never` 与 `/admin/`**  
   末尾斜杠会 404；后来改为 `ignore`，发文入口用纯静态 `/editor.html` 更稳。

2. **View Transitions 导致主题按钮失灵**  
   换页后按钮 DOM 更新，旧点击监听丢失。解决：全局事件委托 + `astro:page-load` 时重新应用主题。

3. **CMS 白屏**  
   外网 CDN 不稳、Astro 页面脚本不执行时，界面会卡在「加载中」。  
   解决：把 Decap 打进 `public/vendor/`，编辑器用静态 HTML 打开。

4. **草稿与生产**  
   构建期按 `import.meta.env.PROD` 过滤 draft，避免草稿上线。

## 小结

| 问题 | 答案 |
|------|------|
| 用什么搭的？ | Astro 5 + Markdown + 原生 CSS |
| 文章存在哪？ | `src/content/posts/*.md` |
| 怎么预览？ | `npm run dev` |
| 怎么网页发文？ | `npm run write` → `/editor.html` |
| 怎么上线？ | `npm run build`，部署 `dist/` |

这个站点的目标不是「功能堆到满」，而是**先有一个舒服、可维护的数字小花园**。结构清楚了，加搜索、分页、CMS 都只是在同一条路上往前走。

若你也想从零搭一个类似的站：先定内容类型和视觉，再选静态生成框架，最后才考虑后台——顺序反了，容易把博客做成半拉子后台系统。

---

*本文即写在本仓库里的示例文，路径：`src/content/posts/how-this-blog-was-built.md`。*
