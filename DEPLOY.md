# 把「森木笔记」部署到公网

目标：别人可以通过 `https://xxx.vercel.app` 打开你的博客。

## 一、确认 GitHub 用户名

浏览器打开 https://github.com ，登录后看头像旁或个人主页地址：

`https://github.com/你的用户名`

记下这个用户名（下面用 `YOUR_USER` 代替）。

## 二、在 GitHub 新建仓库

1. 打开：https://github.com/new  
2. Repository name：`senmu-notes`  
3. 选 **Public**  
4. **不要**勾选 “Add a README”（空仓库更方便直接推送）  
5. 点 **Create repository**

## 三、把本地代码推上去

在 PowerShell 中执行（把 `YOUR_USER` 换成你的用户名）：

```powershell
cd D:\GrokTest\.worktrees\personal-blog

git remote remove origin 2>$null
git remote add origin https://github.com/YOUR_USER/senmu-notes.git
git branch -M main
git push -u origin main
```

推送时会弹出 GitHub 登录 / Personal Access Token。  
若要求 Token：GitHub → Settings → Developer settings → Personal access tokens，勾选 `repo` 权限。

## 四、用 Vercel 发布（免费）

1. 打开 https://vercel.com  
2. 用 **GitHub** 账号登录并授权  
3. **Add New… → Project**  
4. 选中 `senmu-notes` → **Import**  
5. 设置一般自动识别为 Astro：  
   - Build Command: `npm run build`  
   - Output Directory: `dist`  
6. 点 **Deploy**

完成后会得到类似：

`https://senmu-notes.vercel.app`  
或 `https://senmu-notes-xxx.vercel.app`

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
