# 🚀 部署指南（零基础版）

> 本指南将一步步教你把 Life Organizer 部署到 Vercel。整个过程约 **10-15 分钟**，全程在浏览器中操作。
> 完成部署后，你的 iPhone/iPad/电脑都能访问，全球可用。

---

## 📋 准备工作

你需要准备：
- ✅ 一台能上网的设备（电脑或 iPad，手机也行）
- ✅ 邮箱（用来注册 GitHub/Supabase/Vercel 三个服务）
- ✅ 这个项目代码（本目录所有文件）

---

## 第一步：注册账号（约 5 分钟）

你需要注册三个**完全免费**的服务，建议用同一个邮箱：

### 1.1 GitHub（代码托管）
1. 访问 https://github.com/signup
2. 填邮箱、密码、用户名
3. 验证邮箱
4. 选 Free 计划

### 1.2 Supabase（免费云数据库，500MB够你用好几年）
1. 访问 https://supabase.com
2. 点 "Start your project"
3. 用 GitHub 账号一键登录（推荐）

### 1.3 Vercel（免费前端部署）
1. 访问 https://vercel.com/signup
2. 用 GitHub 账号一键登录（推荐）

> 💡 **小贴士**：用 GitHub 登录 Supabase 和 Vercel 就不用记三个密码了。

---

## 第二步：在 Supabase 创建数据库（约 3 分钟）

### 2.1 创建项目
1. 登录 Supabase 后，点 "New Project"
2. 填：
   - **Name**: `life-organizer`（随便命名）
   - **Database Password**: 设置一个强密码并**复制保存**（如 `SupaDB_xA8f3K!2026`）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Singapore`（离中国大陆最近）
3. 点 "Create new project"，等待 1-2 分钟创建完成

### 2.2 初始化数据库表
1. 创建完成后，左侧菜单找到 `SQL Editor`（图标：📝）
2. 点 "New query"
3. 把项目里 `supabase/schema.sql` 文件的**全部内容**复制粘贴进去
4. 点右下角 "Run" 按钮（或按 Cmd/Ctrl+Enter）
5. 看到 "Success. No rows returned" 表示成功

### 2.3 获取 API 密钥
1. 左侧菜单找到 `Project Settings`（齿轮图标）→ `API`
2. 复制这两个值（**千万别关页面，后面要用**）：

   - **`Project URL`**（形如 `https://xxxxx.supabase.co`）
   - **`anon public`** 密钥（在 "Project API keys" 部分，找到 anon 一行，点复制）

---

## 第三步：上传代码到 GitHub（约 3 分钟）

### 3.1 创建新仓库
1. 登录 GitHub，点右上角 **+** → **New repository**
2. 填：
   - **Repository name**: `life-organizer`
   - **Public** 或 Private 都行
   - **不要勾选** "Add a README file"（下面我们上传完整项目）
3. 点 "Create repository"

### 3.2 上传项目代码
**方法 A：用浏览器上传（推荐小白）**
1. 在新仓库页面，点击 "uploading an existing file" 链接
2. 把整个项目文件夹的所有文件/子文件夹**拖拽到浏览器窗口**（注意：不要拖 `node_modules` 文件夹，但是项目下没有这个文件夹，我们项目代码里已经通过 `.gitignore` 排除了）
   - macOS 用户在 Finder 选中项目所有文件拖入即可
3. 滚到底部，点 "Commit changes"

**方法 B：用 GitHub Desktop（推荐熟悉点的用户）**
1. 下载 [GitHub Desktop](https://desktop.github.com)
2. File → Add Local Repository → 选本项目文件夹
3. 点 "Publish repository"

### 3.4 等待上传完成
完成后你应该能在 GitHub 仓库页面看到所有项目文件。

---

## 第四步：在 Vercel 部署（约 3 分钟）

### 4.1 导入项目
1. 访问 https://vercel.com/dashboard
2. 点 "Add New..." → "Project"
3. 在 "Import Git Repository" 下找到你的 `life-organizer` 仓库
4. 点 "Import"

### 4.2 配置环境变量（重要！）
在部署配置页面：
1. 展开 "Environment Variables"
2. **逐个添加**以下变量（点 "Add" 按钮添加，每次一行）：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 刚才在 Supabase 复制的 Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 刚才在 Supabase 复制的 anon public 密钥 |
| `APP_LOGIN_PASSWORD` | 你要设置的登录密码（自定义一个强密码，如 `MyLifeApp!2026`） |
| `JWT_SECRET` | 运行下面命令生成（见下） |

**生成 JWT_SECRET 的方法：**

打开终端（macOS: Spotlight 搜"终端"，Windows: 命令提示符），输入：

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

如果提示 "node: command not found"，需要装 Node.js：
- macOS 用户：在终端输入 `brew install node`（需要先装 Homebrew，详见 https://brew.sh）
- 或者直接访问 https://nodejs.org 下载安装包
- Windows 用户：访问 https://nodejs.org 下载安装包

复制命令输出的字符串，粘贴到 Vercel 的 `JWT_SECRET` 字段。

3. 点 "Deploy"

### 4.3 等待部署
- Vercel 会自动安装依赖、构建、部署，约 1-2 分钟
- 构建完成后会显示 "🎉 Your project has been successfully deployed"
- 给你的网址形如 `https://life-organizer-xxx.vercel.app`

**🎉 部署完成！** 在浏览器中打开这个网址试试。

---

## 第五步：登录并使用

1. 浏览器打开 Vercel 给你的网址
2. 输入你设置的 `APP_LOGIN_PASSWORD` 密码
3. 进入应用！

---

## 第六步：安装到 iPhone/iPad 主屏幕（像 APP 一样）

### 6.1 在 iPhone/iPad 上
1. 用 **Safari**（不能用 Chrome）打开你的网址
2. 点底部的"分享"按钮 📤（方框朝上的箭头）
3. 向下滚动找到"添加到主屏幕" ➕
4. 改名为"Life Organizer"（或你喜欢的）
5. 点右上角"添加"
6. 回到主屏幕，应该看到一个紫色日历图标

### 6.2 像 APP 一样使用
- 从主屏幕图标启动 → 全屏显示，无浏览器地址栏
- 支持横屏（iPad 体验更佳）
- 在设置页可切换深色模式

---

## 🔧 常见问题

### Q1: 部署后打开是空白页 / 404
检查 Vercel 的部署日志：
1. Vercel Dashboard → 你的项目 → Deployments
2. 点最新的部署 → "View Logs"
3. 把错误截图发给我

### Q2: 登录提示"密码错误"
检查环境变量：
1. Vercel → Settings → Environment Variables
2. 确认 `APP_LOGIN_PASSWORD` 没有多余的空格
3. 修改后重新部署（Deployments → 最新版本 → 右上 ⋯ → Redeploy）

### Q3: OCR 不工作
- 首次使用需要联网下载约 20MB 引擎
- 在浏览器中打开控制台查看具体错误
- 如果用 Safari，可能需要 HTTPS（Vercel 自动有）

### Q4: 我想换个密码
去 Vercel → Settings → Environment Variables → 修改 `APP_LOGIN_PASSWORD` → Redeploy。

### Q5: 数据安全吗？
- 你的数据存在 Supabase（行业领先的 Postgres 托管）
- Vercel 自动 HTTPS
- 只有知道密码的人能访问
- 你也可以随时导出 JSON 备份

### Q6: 我没装 node 怎么生成 JWT_SECRET？
在 Vercel 的环境变量里随便填一个长字符串就行，例如：
```
JHsdf83kjasd987asd8f7asd978f7asd978fahsdkjfhasdkjfh
```
即使不是真正随机生成的，只要长度够长也无法暴力破解。

### Q7: 想绑定自己的域名？
1. 在 Vercel → Settings → Domains 添加
2. 按提示在你的域名服务商（阿里云/腾讯云/Cloudflare）配置 DNS
3. Vercel 自动签发 SSL 证书

---

## 🆘 我需要帮助

部署过程中遇到任何问题，按以下方式获取帮助：
1. 截图错误信息发给我
2. 告诉我在哪一步卡住了
3. 描述你看到的页面（白屏？报错？）

---

## ✅ 部署完成后的检查清单

- [ ] 能用密码登录
- [ ] 在计划模块创建一个事件并保存
- [ ] 在总结模块启动计时器并停止
- [ ] 在日记模块写入一段文字并保存
- [ ] 在 SOP 模块创建一个流程
- [ ] 在设置页导出数据 JSON
- [ ] 在 iPhone Safari 打开并"添加到主屏幕"

全部通过？恭喜，你的个人效率 APP 正式上线了！🎉
