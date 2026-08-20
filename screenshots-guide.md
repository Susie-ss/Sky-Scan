# Sky Scan · Chrome Web Store 截图操作清单

> Web Store 要求至少 1 张截图，推荐 5 张。规格：**1280×800** 或 **640×400**（推荐前者）。
> Chrome Web Store 截图建议展示真实使用场景，不要纯文字截图。

---

## 📐 截图规格

| 项目 | 要求 |
|------|------|
| 尺寸 | **1280 × 800 px**（推荐）或 640 × 400 px |
| 格式 | PNG 或 JPG |
| 数量 | 至少 1 张，最多 5 张 |
| 内容 | 真实使用截图（不要纯文字 / 纯图标）|

---

## 📸 5 张截图清单

### 截图 1 — 表格采集主界面（必拍）

**展示内容**：扩展 popup 已检测到表格的状态

**操作步骤**：
1. Chrome 打开任意带表格的页面（如 https://element.eleme.io/#/zh-CN/component/table 或任意后台）
2. 点击 Sky Scan 扩展图标
3. 等待自动检测到表格（popup 显示「✅ 检测完成！找到 N 个表格」）
4. 确保 popup 完全展开 + 后面网页可见

**截图快捷键**：`Cmd + Shift + 4` → 空格 → 鼠标点 Chrome 窗口
或用 Chrome 自带的 `Cmd + Shift + 4` 选区截图

**保存路径**：`/Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots/01-table-detect.png`

---

### 截图 2 — 列勾选 + 分页配置（必拍）

**展示内容**：popup 中列勾选区已展开 + 高级选择器面板展开

**操作步骤**：
1. 在截图 1 的基础上
2. 点开「▶ 高级选择器（可选）」展开高级面板
3. 让分页设置、列勾选、高级面板都可见

**保存路径**：`/Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots/02-columns-pagination.png`

---

### 截图 3 — 采集中状态（强烈推荐）

**展示内容**：进度条 + 已采集条数 + 状态栏显示「第 X/N 页，本页 Y 条，累计 Z 条」

**操作步骤**：
1. 在一个有多页的表格页面（如 Element UI 表格 demo）
2. 配置好分页模式 → 点「▶ 开始采集」
3. 等到采集到第 2–3 页时截图（显示进度条在 30%–60% 之间最佳）

**保存路径**：`/Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots/03-scraping-progress.png`

---

### 截图 4 — 文章导出 Tab（必拍）

**展示内容**：popup 切换到「📄 文章导出」Tab，已检测到文章

**操作步骤**：
1. Chrome 打开任意博客文章 / 新闻页（如 https://zhuanlan.zhihu.com/p/xxx 或 https://overreacted.io/任意文章）
2. 点击 Sky Scan 图标
3. 点「📄 文章导出」Tab
4. 等待自动检测到文章（显示标题 + 字数 + 图片数）

**保存路径**：`/Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots/04-article-detect.png`

---

### 截图 5 — 导出的 .docx 在 Word 中打开效果（强烈推荐）

**展示内容**：导出的 .docx 文件在 Word/WPS 中打开，展示保留的标题/段落/图片

**操作步骤**：
1. 在截图 4 基础上点「⬇ 导出为 Word」
2. 等待下载完成
3. 用 Word / WPS / Pages 打开导出的 .docx 文件
4. 截一张打开后的效果图（Word 窗口 + 文档内容可见）

**保存路径**：`/Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots/05-docx-result.png`

---

## 🎯 操作要点

### 1. 让窗口足够大

调整 Chrome 窗口到 1280px 宽以上（截图会按窗口比例裁）。
可以在终端用以下命令调整 Chrome 窗口大小：

```bash
# 用 AppleScript 调整 Chrome 窗口（可选）
osascript -e 'tell application "Google Chrome" to set bounds of window 1 to {0, 0, 1280, 800}'
```

### 2. 浏览器开发者工具分离

不要让 DevTools 占用窗口空间，关闭 DevTools 或独立窗口。

### 3. popup 截图技巧

popup 是浮层，点 popup 外的区域会关闭 popup。截图时：
- 用 `Cmd + Shift + 4` 选区截图（不要用窗口截图）
- 或先 `Cmd + Shift + 4`，再按空格进入窗口模式，但 popup 不是独立窗口所以不行
- **最佳方法**：用 Chrome 截整个窗口，popup 也会被截进去

### 4. 后续裁剪

截完图发给我（路径直接用上面的），我用 `sips` 命令帮你统一裁剪到精确的 1280×800：

```bash
# 示例：把任意尺寸 PNG 裁剪到 1280x800
sips -z 800 1280 /path/to/screenshot.png
```

---

## 📂 截图保存位置

建议先创建目录：

```bash
mkdir -p /Users/q1a2z3/Documents/Code/WorkBuddy/Skill/web-scraper-pro/screenshots
```

然后按上面的命名规范保存 5 张图。

截完发我路径，我帮你：
1. 裁剪到 1280×800 精确尺寸
2. 检查图片质量
3. 一起加进 GitHub 仓库提交
