# 一键推送到 https://github.com/goo122/senmu-notes
# 用法：在 PowerShell 中执行
#   cd D:\GrokTest\.worktrees\personal-blog
#   .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

git remote remove origin 2>$null
git remote add origin https://github.com/goo122/senmu-notes.git
git branch -M main

Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "推送成功！" -ForegroundColor Green
  Write-Host "仓库: https://github.com/goo122/senmu-notes"
  Write-Host ""
  Write-Host "下一步：打开 https://vercel.com 用 GitHub 登录，Import 仓库 senmu-notes，Deploy。"
  Write-Host "构建命令: npm run build"
  Write-Host "输出目录: dist"
} else {
  Write-Host ""
  Write-Host "推送失败。常见原因：" -ForegroundColor Yellow
  Write-Host "1. 访问不了 GitHub（需要代理/VPN）"
  Write-Host "2. 未登录：推送时按提示登录，或使用 Personal Access Token"
  Write-Host "3. 仓库不存在或没有写权限：确认已创建 goo122/senmu-notes"
}
