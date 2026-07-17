# 把「森木笔记」部署到公网

目标：别人可以通过 `https://xxx.vercel.app` 打开你的博客。

## 一、确认 GitHub 用户名

浏览器打开 https://github.com ，登录后看头像旁或个人主页地址：

`https://github.com/你的用户名`

本仓库地址：

**https://github.com/goo122/senmu-notes**

代码已推送到 `main` 分支。

## 二、用 Vercel 发布（免费，约 2 分钟）

1. 打开 https://vercel.com  
2. 用 **GitHub** 账号登录（选 goo122），并授权访问仓库  
3. **Add New… → Project**  
4. 选中 **senmu-notes** → **Import**  
5. 框架选 **Astro**（一般会自动识别）：  
   - Build Command: `npm run build`  
   - Output Directory: `dist`  
   - Install Command: `npm install`  
6. 点 **Deploy**，等待绿色成功  

完成后会得到类似：

`https://senmu-notes.vercel.app`  
或 `https://senmu-notes-xxxx.vercel.app`

把这个链接发给别人即可访问。

## 五、改成你的真实域名（可选但推荐）

部署成功后，编辑两个文件里的地址，再 `git push`：

1. `astro.config.mjs` → `site: 'https://你的vercel域名'`  
2. `src/lib/site.ts` → `url: 'https://你的vercel域名'`

Vercel 会自动重新构建。

## 六、以后更新文章

```powershell
cd D:\GrokTest\.worktrees\personal-blog
# 改文章或用 npm run write 发文后：
git add -A
git commit -m "content: update posts"
git push
```

推送后 Vercel 自动更新网站。

## 说明

- 公网目前主要用于**阅读博客**  
- 本机网页发文（`npm run write` + `/editor.html`）改完再 `git push` 即可上线  
- 若要在公网页面直接写文章，需要额外配置 GitHub 后端（可之后再做）
