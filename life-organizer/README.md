# Life Organizer - 你的个人日程·日历·日记·SOP一体化APP

> **完全免费·零基础可用·iPhone/iPad/电脑全平台**

一款基于 PWA 技术的个人效率管理应用，结合了日程计划、时间记账、AI OCR 日记、SOP 流程库四大功能。

---

## ✨ 功能亮点

### 📅 计划
- **年/月/日三层日历视图**，仿 Apple 日历体验
- 年视图支持**关键日高亮**，月视图支持**文字+图片备注**
- 日视图24小时时间轴，事件可设提醒
- 支持每日/每周/每月**重复事件**
- 与 SOP 联动：一键将 SOP 步骤展开到日历

### 📊 总结
- 浮动计时器：开始 → 选择标签 → 停止 → 自动记录
- 周/月/年**可视化图表**（堆叠柱状图/饼图/热力图）
- **体重记录** + 趋势折线图 + 目标对比

### 📔 日记
- 手动写作（支持心情、图片）
- **OCR 截图识别**：上传 ChatGPT 聊天截图，自动提取文字成日记
- 中英文 OCR 支持

### 📋 SOP
- 创建标准操作流程（步骤+预估时长）
- 一键执行，按步骤勾选完成
- 与日历联动：插入日计划自动展开为时间块

### ⚙️ 通用
- 深色/浅色主题
- 数据导出为 JSON 备份
- PWA 安装到主屏幕，像原生APP一样使用
- 单密码保护（仅你可访问）

---

## 🚀 快速开始（部署到云端，5-10分钟）

完整分步教程见 [DEPLOY.md](./DEPLOY.md)。简要流程：

1. 注册 [GitHub](https://github.com) 账号
2. 注册 [Supabase](https://supabase.com) 账号（免费）
3. 在 Supabase 创建项目，跑一次 `supabase/schema.sql`
4. 上传代码到 GitHub 仓库
5. 在 [Vercel](https://vercel.com) 一键导入 GitHub 仓库并部署
6. 配置环境变量（Supabase URL、登录密码、JWT密钥）
7. 打开部署后的网址，输入密码登录

完整截图步骤见 [DEPLOY.md](./DEPLOY.md)。

---

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 图表 | Chart.js / 自研热力图 |
| OCR | Tesseract.js (浏览器端) |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | 单密码 + JWT Cookie |
| 部署 | Vercel |
| PWA | 原生 Service Worker |

---

## 📱 在 iPhone/iPad 上使用

部署后访问你的网址（如 `https://life-organizer.vercel.app`）：

1. 用 Safari 打开网址
2. 点击底部的"分享"按钮 📤
3. 选择"添加到主屏幕" ➕
4. 命名后点"添加"
5. 以后从主屏幕图标启动，全屏体验像原生APP

---

## 🔒 安全性

- 全站 HTTPS（Vercel 自动）
- 单密码保护（环境变量配置）
- JWT Cookie 鉴权
- 你一个用户专用，外部无法访问
- 数据存储在 Supabase 全球分布式 Postgres

如果忘记密码，可以到 Vercel 的 Settings → Environment Variables 重新设置 `APP_LOGIN_PASSWORD`，然后触发重新部署即可。

---

## 💾 数据备份

在设置页"数据"分区，可以一键导出全部数据为 JSON 文件。建议每月导出一次做备份。

---

## 📂 项目结构

```
.
├── app/                    # Next.js 路由
│   ├── (main)/             # 已登录用户主区域
│   │   ├── plan/           # 计划（年/月/日）
│   │   ├── review/         # 总结（计时+图表+体重）
│   │   ├── diary/          # 日记（手动+OCR）
│   │   ├── sop/            # SOP 模板库
│   │   └── settings/       # 设置
│   ├── login/              # 登录页
│   ├── api/                # 后端 API
│   ├── sw.js               # Service Worker
│   └── manifest.json       # PWA 配置
├── components/             # 复用组件
├── lib/                    # 工具与类型
├── supabase/schema.sql     # 数据库结构
└── public/icons/           # PWA 图标
```

---

## 🆘 常见问题

**Q：能在 Windows 上部署吗？**
A：可以。整个流程在浏览器中完成，与操作系统无关。

**Q：数据会丢吗？**
A：不会。数据存在 Supabase 云数据库，可用性 99.9%。建议每月导出 JSON 备份一次。

**Q：可以邀请朋友一起用吗？**
A：当前版本是单人密码模式。如需多用户，需要扩展认证逻辑（可后续迭代）。

**Q：OCR 准确率怎么样？**
A：Tesseract.js 对清晰的截图识别率 85-95%。较模糊的手写体可能差一些。

**Q：能离线使用吗？**
A：PWA 基础缓存已配置，但首次使用 OCR 需要联网下载引擎（~20MB）。

**Q：能换成其他 AI 模型吗？**
A：当前版本只做 OCR。如需接入真正的 ChatGPT，需要 OpenAI API 密钥（每月约 $5）。

---

## 📜 License

MIT - 自由使用、修改、分发。
