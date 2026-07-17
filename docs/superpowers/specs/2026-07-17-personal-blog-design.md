# 个人博客网站设计规格

**日期：** 2026-07-17  
**状态：** 已批准（待实现）  
**代号：** 森木笔记（可配置站名）

## 1. 目标与成功标准

搭建一个**展示优先**的个人博客：页面精美、阅读舒适、信息架构完整。第一版不要求发文后台；文章以本地 Markdown 管理，便于日后接入 CMS。

### 成功标准

- 五类核心路由可访问，桌面与移动端均可用
- 至少 3 篇中文示例文章，覆盖 `tech` / `life` / `notes`
- 标签页可筛出对应文章
- 视觉符合「温暖极简」设计 token
- `npm run build` 成功产出静态站点

## 2. 背景与决策

| 决策项 | 选择 |
|--------|------|
| 内容类型 | 综合型（技术 + 生活 + 其他） |
| 写作方式 | 第一版仅展示；写作/CMS 后续再定 |
| 页面范围 | 完整基础站：首页、列表、详情、关于、分类/标签（不含搜索） |
| 视觉风格 | 温暖极简（浅色、圆角卡片、橙色强调） |
| 技术路径 | **Astro + Markdown**（Content Collections） |

### 明确不做（YAGNI）

- 全站搜索、评论系统
- 登录后台 / 数据库 CMS
- 多语言
- 复杂动画与重交互

可选后续：RSS、暗色模式、Decap/Sveltia CMS、搜索。

## 3. 架构

### 3.1 技术栈

- **框架：** Astro（静态输出）
- **内容：** Astro Content Collections + Markdown
- **样式：** 全局 CSS + 设计 token（不强制 Tailwind，可用原生 CSS 保持轻量）
- **字体：** 现代无衬线（如系统栈或 DM Sans + 中文回退）
- **部署形态：** 纯静态（可部署至任意静态托管）

### 3.2 目录结构

```
src/
  pages/           # 路由
  layouts/         # BaseLayout 等
  components/      # PostCard、TagPill、Prose 等
  styles/          # tokens.css、global.css、prose.css
  content/
    config.ts      # collection schema
    posts/         # *.md 文章
public/            # 头像、favicon 等
```

### 3.3 路由地图

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero 自我介绍 + 精选/最新文章 + 分类入口 |
| `/blog` | 文章列表 | 按 `pubDate` 倒序；可展示分类筛选入口 |
| `/blog/[slug]` | 文章详情 | Prose 排版、标签、上一篇/下一篇；长文可选目录 |
| `/about` | 关于我 | 个人故事、兴趣、社交链接 |
| `/tags` | 标签索引 | 标签云 / 列表 |
| `/tags/[tag]` | 单标签列表 | 该标签下文章；空则空状态 |
| 404 | 友好 404 | 未知路径 |

分类（`category`）作为文章字段与视觉色标出现；第一版可不单独做 `/categories/[cat]` 路由，在列表/首页用筛选或分组即可。标签为独立路由。

## 4. 内容模型

### 4.1 Post frontmatter（schema）

```yaml
title: string          # 必填
description: string    # 必填（列表摘要与 SEO）
pubDate: date          # 必填
updatedDate: date      # 可选
tags: string[]         # 必填，可为空数组
category: enum         # 必填：tech | life | notes | other
draft: boolean         # 可选，默认 false；true 时生产列表/标签不收录
heroImage: string      # 可选，public 路径
featured: boolean      # 可选，首页精选
```

### 4.2 数据流

1. 作者在 `src/content/posts/*.md` 编写 frontmatter 与正文  
2. Content Collections 按 schema 校验  
3. 页面通过 `getCollection('posts')` 获取：过滤 `draft`（生产环境）、按日期排序、按 tag 聚合  
4. `astro build` 生成静态 HTML；`astro dev` 本地预览与热更新  

### 4.3 边界行为

| 情况 | 行为 |
|------|------|
| `draft: true` | 不出现在生产列表、首页、标签聚合 |
| 未知 slug / 未知 tag | 404 或「暂无文章」空状态（tag 无文章时用空状态更友好） |
| 缺 description | schema 校验失败，构建中断（description 必填） |
| 无 featured 文 | 首页「最新文章」退化为按日期取前 N 篇 |

## 5. 组件设计

每个单元职责单一、接口清晰：

| 组件 | 输入（概念） | 职责 |
|------|----------------|------|
| `BaseLayout` | title, description, 子内容 | 导航、页脚、SEO head、全局壳 |
| `Header` / `Footer` | 当前路径（可选） | 站名、导航高亮、版权与社交 |
| `PostCard` | post 摘要字段 | 列表/首页卡片 |
| `TagPill` | tag, href | 可点击胶囊标签 |
| `CategoryBadge` | category | 分类色标（非必须链接） |
| `Prose` | 插槽 HTML | Markdown 渲染后的阅读样式 |
| `PostMeta` | date, category, tags | 详情页信息条 |
| `PostNav` | prev, next | 上一篇 / 下一篇 |

工具函数（可放 `src/lib/` 或 `src/utils/`）：

- `getPublishedPosts()` — 过滤 draft + 排序  
- `getPostsByTag(tag)`  
- `getAllTags()` — 聚合标签与计数  
- `getNeighborPosts(slug)` — 上一篇/下一篇  

## 6. 视觉设计

### 6.1 设计 token

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg` | `#FFFDF9` | 页面背景 |
| `--text` | `#1C1917` | 主文字 |
| `--muted` | `#78716C` | 次要文字 |
| `--accent` | `#EA580C` | 主按钮、链接、强调 |
| `--soft` | `#FFF7ED` | 次要按钮底、标签底 |
| `--border` | `#FFEDD5` | 卡片描边 |
| `--radius-card` | `12–16px` | 卡片圆角 |
| `--shadow-soft` | 低对比柔和阴影 | 卡片浮起感 |

### 6.2 版式与交互

- 正文约 17–18px，行高约 1.75；阅读栏最大宽约 680px  
- 大圆角卡片、胶囊按钮与标签  
- Hover：轻微上浮或阴影加深  
- 页面进入：轻微淡入；动效克制  
- 响应式：移动单栏；桌面顶栏横排导航  
- 默认站名：**森木笔记**（实现时集中配置，便于改名）

### 6.3 首页信息结构

1. 顶栏：站名 + 首页 / 文章 / 标签 / 关于  
2. Hero：头像 + 问候文案 + CTA（阅读文章、关于我）  
3. 精选或最新文章卡片区  
4. 可选：分类快捷入口  
5. 页脚：版权、社交链接  

### 6.4 关于页

静态内容即可（可放 Markdown 或 Astro 页面内文案）：简短自我介绍、兴趣方向、外链（GitHub / 邮箱等占位）。

## 7. SEO 与基础体验

- 每页独立 `<title>` 与 meta description  
- 文章页 Open Graph 基础字段（title/description；有 hero 则用图）  
- 语义化 HTML：`<main>`、`<article>`、导航 `aria` 合理即可  
- 图片：头像等提供合理尺寸与 alt  

## 8. 示例内容

至少 3 篇中文示例：

1. **tech** — 例如前端/工程相关随笔  
2. **life** — 生活随笔  
3. **notes** — 短想法或读书笔记  

可另加 1–2 篇展示 `featured` 与多标签。作者与关于页使用友好占位文案，配置项集中，便于用户替换成真实信息。

## 9. 错误处理与测试

### 错误处理

- 构建期：schema 校验失败应使 build 失败（尽早暴露）  
- 运行期：全静态，无 API 错误路径  
- 404：自定义友好页，链回首页/文章列表  

### 验证方式（实现阶段）

- 本地 `astro dev` 手动走通五类路由与标签筛选  
- `astro build` + `astro preview` 确认生产过滤 draft  
- 窄屏（约 375px）与桌面宽度目视检查布局  

自动化测试非第一版必须；以构建成功 + 手动验收清单为准。

## 10. 验收清单

- [ ] `/` 首页 Hero + 文章区完整、风格正确  
- [ ] `/blog` 列表按日期倒序  
- [ ] `/blog/[slug]` 阅读舒适，含标签与上下篇  
- [ ] `/about` 内容完整可替换  
- [ ] `/tags` 与 `/tags/[tag]` 工作正常  
- [ ] 至少 3 篇示例覆盖 tech/life/notes  
- [ ] 移动端导航与卡片不溢出、可点  
- [ ] `npm run build` 成功  

## 11. 实现顺序建议

1. 初始化 Astro 项目与设计 token / BaseLayout  
2. Content schema + 示例 Markdown  
3. 博客列表与详情  
4. 首页 Hero 与精选/最新  
5. 标签索引与详情  
6. 关于页 + 404  
7. 细节打磨（动效、SEO、响应式）与 build 验收  

---

**下一步：** 用户确认本 spec 无修改后，编写实现计划（writing-plans），再动手编码。
