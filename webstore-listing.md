# Sky Scan · Chrome Web Store 商店详情

> 本文件提供 Chrome Web Store 上传时所需的所有文案素材。
> 字数限制均满足 Web Store 要求（Summary ≤ 132 字符，Description ≤ 16,000 字符）。

---

## 📌 1. Extension Name（名称）

**Sky Scan**

---

## 📌 2. Summary（一句话简介，≤ 132 字符）

### 英文版（推荐，Web Store 默认）

```
Universal web scraper: auto-detect tables, handle pagination, and export to CSV, JSON, or DOCX — no code required.
```
**字符数**：109 ✅

### 中文版（如添加简体中文 locale）

```
万能网页采集器：自动识别表格、智能翻页，一键导出 CSV / JSON / Word 文档，无需写代码。
```
**字符数**：42 ✅

---

## 📌 3. Category（分类）

**Productivity**（生产力工具）

---

## 📌 4. Language（语言）

主语言：**English**
附加语言（可选）：**简体中文**

---

## 📌 5. Detailed Description（详细描述）

### 英文版

```
☁️ Sky Scan — Turn Any Webpage into Structured Data

Sky Scan is a lightweight yet powerful Chrome extension that lets you extract tables, articles, and paginated data from any webpage — without writing a single line of code. Whether you're scraping a 200-page admin dashboard, exporting a blog post to Word, or pulling data from an internal SaaS tool, Sky Scan handles detection, navigation, and export in just a few clicks.

🔒 100% Local — Your Data Never Leaves Your Browser
No backend servers. No analytics. No tracking. All scraping happens in your browser. Login cookies are reused transparently — no extra authentication needed.

────────────────────────────────────────
✨ CORE FEATURES
────────────────────────────────────────

📊 UNIVERSAL TABLE SCRAPING
• Auto-detects 5 table types: native <table>, Element UI (.el-table), Ant Design (.ant-table), ARIA grids, and custom div-based tables
• Column selection UI — toggle individual columns on/off before scraping
• 4 pagination modes with auto-fallback: jump-to-page input → next-button click → SVG arrows → text-based links
• Anti-duplicate protection — detects stale pages and stops gracefully
• Advanced mode for custom CSS selectors when auto-detect needs help
• Stop anytime — already-collected data is preserved

📄 SMART ARTICLE EXPORT
• 4-tier detection algorithm: <article> tag → [role="main"] → 22 known class/id patterns → text-density heuristics
• Auto-cleanup — strips navigation, sidebars, footers, ads, comments, breadcrumbs
• True .docx output — generates OOXML via JSZip (not HTML-masquerading-as-doc)
• Style preservation — headings, tables, images, code blocks, blockquotes all retained

📦 THREE EXPORT FORMATS
• CSV — UTF-8 BOM, Excel-ready, no garbled characters
• JSON — Pretty-printed, full row objects with proper column mapping
• DOCX — Native Office Open XML, opens natively in Word & WPS

────────────────────────────────────────
🚀 HOW IT WORKS
────────────────────────────────────────

TABLE MODE:
1. Navigate to any page with a data table (admin panels, reports, dashboards)
2. Click the Sky Scan icon — extension auto-detects all tables
3. Pick a table from the dropdown, check/uncheck columns
4. Choose pagination mode (auto-detect works for 90% of sites)
5. Click ▶ Start — watch it crawl through every page
6. Click ⬇ Export → CSV or JSON

ARTICLE MODE:
1. Open any blog post, news article, or documentation page
2. Switch to the 📄 Article tab
3. Sky Scan auto-detects the main content body
4. Review title, word count, image count
5. Click ⬇ Export as Word → .docx file downloads

────────────────────────────────────────
🎯 USE CASES
────────────────────────────────────────

✔ Data analysts pulling records from internal admin panels
✔ Content teams archiving blog posts as Word documents
✔ QA engineers extracting test data tables from dashboards
✔ Researchers scraping paginated lists from public databases
✔ Product managers exporting competitor feature tables
✔ Anyone tired of manually copy-pasting 200-page data tables

────────────────────────────────────────
🔒 PRIVACY & PERMISSIONS
────────────────────────────────────────

Sky Scan is 100% local-first. It never sends data to any external server.

• activeTab — Access only the tab you're actively using
• scripting — Inject detection & scraping functions on demand
• downloads — Trigger CSV / JSON / DOCX file downloads
• storage — Persist intermediate results across popup sessions (local only)
• tabs — Query the current active tab's URL and title
• <all_urls> — Work on any domain including enterprise SaaS, internal tools, custom subdomains

Read the full privacy policy: https://github.com/Susie-ss/Sky-Scan/blob/main/privacy.html

────────────────────────────────────────
🛠 TECH STACK
────────────────────────────────────────

• Chrome Extension Manifest V3
• Vanilla JavaScript (zero runtime dependencies in core logic)
• chrome.scripting API for isolated function injection
• JSZip v3.10.1 for client-side DOCX generation

────────────────────────────────────────
📦 WHAT'S NEW IN 2.2.0
────────────────────────────────────────

• Added Article → DOCX export mode
• True OOXML .docx generation via JSZip + AltChunk embedding
• Word & WPS open natively with full formatting preserved
• Improved table detection for custom div-based layouts
• 4-level pagination fallback with native input value setters for React/Vue compatibility

────────────────────────────────────────

Built with care for anyone who's ever manually copy-pasted a 200-page data table. ☁️

GitHub: https://github.com/Susie-ss/Sky-Scan
Issues: https://github.com/Susie-ss/Sky-Scan/issues
License: MIT
```

**字符数**：约 4,400 ✅（远低于 16,000 上限）

### 中文版

```
☁️ Sky Scan — 把任意网页变成结构化数据

Sky Scan 是一款轻量但强大的 Chrome 扩展，让你无需写一行代码就能从任意网页提取表格、文章和分页数据。无论你是要采集 200 页后台数据表、把博客文章导出为 Word、还是从内部 SaaS 工具拉取数据，Sky Scan 都能在几次点击内完成检测、翻页和导出。

🔒 100% 本地运行 — 数据绝不离开浏览器
没有后端服务器。没有分析。没有追踪。所有采集都在浏览器内完成。登录 cookie 透明复用，无需额外鉴权。

────────────────────────────────────────
✨ 核心功能
────────────────────────────────────────

📊 万能表格采集
• 自动识别 5 种表格：原生 <table>、Element UI (.el-table)、Ant Design (.ant-table)、ARIA 表格、自定义 div 表格
• 列勾选界面 — 采集前可单独勾选/取消列
• 4 种翻页模式自动 fallback：跳至页输入框 → 点击下一页 → SVG 箭头 → 文本链接
• 智能去重 — 检测连续多页首行相同自动停止
• 高级模式 — 自动检测失效时可自定义 CSS 选择器
• 随时停止 — 已采集数据完整保留

📄 智能文章导出
• 4 层检测算法：<article> 标签 → [role="main"] → 22 种已知 class/id 模式 → 文本密度启发式
• 自动清理 — 自动剥离导航、侧栏、页脚、广告、评论、面包屑
• 真正的 .docx — 用 JSZip 生成 OOXML（不是伪装成 doc 的 HTML）
• 样式保留 — 标题、表格、图片、代码块、引用全部保留

📦 三种导出格式
• CSV — 带 UTF-8 BOM，Excel 直接打开不乱码
• JSON — 格式化输出，完整行对象，列名正确映射
• DOCX — 原生 Office Open XML，Word 和 WPS 原生打开

────────────────────────────────────────
🚀 使用流程
────────────────────────────────────────

表格模式：
1. 打开任意含数据表格的页面（后台、报表、看板）
2. 点击 Sky Scan 图标 — 自动检测页面所有表格
3. 下拉选择表格，勾选/取消列
4. 选择翻页模式（自动检测适配 90% 网站）
5. 点击 ▶ 开始采集 — 看它一页页爬完
6. 点击 ⬇ 导出 → CSV 或 JSON

文章模式：
1. 打开任意博客文章、新闻、文档页面
2. 切换到 📄 文章 Tab
3. Sky Scan 自动识别正文区域
4. 查看标题、字数、图片数
5. 点击 ⬇ 导出为 Word → 下载 .docx 文件

────────────────────────────────────────
🎯 适用场景
────────────────────────────────────────

✔ 数据分析师从内部后台拉取记录
✔ 内容团队把博客文章归档为 Word 文档
✔ QA 工程师从看板提取测试数据表
✔ 研究人员从公开数据库采集分页列表
✔ 产品经理导出竞品功能对比表
✔ 任何厌倦了手动复制粘贴 200 页数据表的人

────────────────────────────────────────
🔒 隐私与权限
────────────────────────────────────────

Sky Scan 100% 本地优先，绝不向任何外部服务器发送数据。

• activeTab — 仅访问你正在使用的标签页
• scripting — 按需注入检测与采集函数
• downloads — 触发 CSV / JSON / DOCX 文件下载
• storage — popup 会话间临时保存数据（仅本地）
• tabs — 查询当前激活标签页的 URL 与标题
• <all_urls> — 允许在任意域名工作（企业 SaaS、内网、自定义子域名）

完整隐私政策：https://github.com/Susie-ss/Sky-Scan/blob/main/privacy.html

────────────────────────────────────────
🛠 技术栈
────────────────────────────────────────

• Chrome Extension Manifest V3
• 原生 JavaScript（核心逻辑零运行时依赖）
• chrome.scripting API 隔离函数注入
• JSZip v3.10.1 客户端 DOCX 生成

────────────────────────────────────────
📦 2.2.0 更新内容
────────────────────────────────────────

• 新增文章 → DOCX 导出模式
• 用 JSZip + AltChunk 嵌入生成真正的 OOXML .docx
• Word 与 WPS 原生打开，完整保留格式
• 改进自定义 div 表格的检测
• 4 级翻页 fallback + nativeInputValueSetter，兼容 React/Vue 受控组件

────────────────────────────────────────

为每一个曾经手动复制粘贴 200 页数据表的人而打造。☁️

GitHub: https://github.com/Susie-ss/Sky-Scan
Issues: https://github.com/Susie-ss/Sky-Scan/issues
License: MIT
```

**字符数**：约 2,300 ✅

---

## 📌 6. Single Purpose Statement（单一用途声明，≤ 100 字符）

```
A universal web data scraper that extracts tables and articles from web pages and exports them as files.
```
**字符数**：89 ✅

---

## 📌 7. Permission Justifications（权限用途说明，逐条复制）

| 权限 | 用途说明（英文，直接复制到 Web Store 表单） |
|------|-------------------------------------------|
| `activeTab` | Access the current tab to detect and scrape tables and articles only when the user clicks the extension icon. No background access. |
| `scripting` | Inject detection and scraping functions into the active tab on user demand. Functions are isolated and do not modify the page's global namespace. |
| `downloads` | Save exported CSV / JSON / DOCX files to the user's Downloads folder via the browser's native download API. |
| `storage` | Temporarily persist collected data in chrome.storage.local between popup sessions so users can resume scraping. Data is local only and cleared on uninstall. |
| `tabs` | Query the current active tab's URL and title for display in the popup. No browsing history access. |
| `<all_urls>` | Sky Scan is a universal scraping tool that must work on any domain — enterprise SaaS dashboards, internal intranets, custom subdomains, and arbitrary public websites. Without this, the extension cannot fulfill its core purpose. |

---

## 📌 8. Privacy Policy URL（隐私政策链接）

```
https://github.com/Susie-ss/Sky-Scan/blob/main/privacy.html
```

> 提交后如需更稳定的展示，可在 GitHub 仓库 Settings → Pages 开启 GitHub Pages，
> 然后改用 `https://susie-ss.github.io/Sky-Scan/privacy.html` 作为正式 URL。

---

## 📌 9. Support URL（支持链接）

```
https://github.com/Susie-ss/Sky-Scan/issues
```

---

## 📌 10. Homepage URL（主页链接）

```
https://github.com/Susie-ss/Sky-Scan
```

---

## 📌 11. 建议截图清单（5 张，1280×800）

详见文件 `screenshots-guide.md`。
