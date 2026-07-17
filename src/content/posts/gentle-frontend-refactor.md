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

```ts
// 小而清晰的边界
export function pickFeatured<T extends { featured?: boolean }>(
  items: T[],
  limit = 3,
) {
  const featured = items.filter((i) => i.featured);
  return (featured.length ? featured : items).slice(0, limit);
}
```

> 重构的成功标志，是下一次需求来时你不再害怕打开那个文件夹。

## 收尾

加几条冒烟路径，删掉「以防万一」的死代码。喝口水，合上电脑——温和，就够了。
