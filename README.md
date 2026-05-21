# ☁️ Sky Scan 数据采集插件

<p align="center">
  <img src="icons/icon128.png" alt="Sky Scan Logo" width="128" />
</p>

<p align="center">
  <strong>One-click web scraper for Chrome. Tables, articles, pagination — all handled.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white" alt="Chrome MV3" />
  <img src="https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/Export-CSV_|_JSON_|_DOCX-27ae60" alt="Export Formats" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/Version-2.2.0-orange" alt="Version" />
</p>

---

## 🔍 What is Sky Scan?

Sky Scan is a lightweight yet powerful Chrome extension that turns **any webpage** into structured data — no coding required. Whether you're scraping a 200-page admin panel table, exporting a blog post to Word, or pulling data from an internal dashboard, Sky Scan handles detection, pagination, and export in just a few clicks.

> **Zero setup. Zero server. Zero data leaves your browser.**

---

## ✨ Core Features

### 📊 Universal Table Scraping

| Capability | Description |
|------------|-------------|
| **Auto-detection** | Scans for `<table>`, Element UI `.el-table`, Ant Design `.ant-table`, ARIA grids, and custom `div`-based tables |
| **Column selection** | Real-time header preview — toggle individual columns on/off before scraping |
| **Pagination** | 4 strategies with auto-fallback: jump-to-page input → next-button click → SVG icon arrows → text-based next links |
| **Duplicate protection** | Detects stale pages (same first-row key across consecutive pages) and stops gracefully |
| **Custom selectors** | Advanced mode for manual CSS overrides when auto-detect needs help |
| **Stop anytime** | Cancel mid-scrape — already-collected data is preserved |

### 📄 Smart Article Export

| Capability | Description |
|------------|-------------|
| **4-tier detection** | `<article>` → `[role="main"]` → 22 known class/id patterns → text-density heuristics |
| **Auto-cleanup** | Strips navigation, sidebars, footers, ads, comments, breadcrumbs automatically |
| **True .docx** | Generates OOXML via JSZip (not HTML-masquerading-as-doc). Word & WPS open natively with full formatting preserved |
| **Style preservation** | Retains headings, tables, images, code blocks, blockquotes, links in exported document |

### 📦 Export Formats

| Format | File Extension | Highlights |
|--------|---------------|------------|
| **CSV** | `.csv` | UTF-8 BOM, Excel-ready, no garbled Chinese characters |
| **JSON** | `.json` | Pretty-printed, full row objects with proper column name mapping |
| **DOCX** | `.docx` | Native Office Open XML via AltChunk embedding — styles, tables, images all preserved |

---

## 🚀 Quick Start

### Installation (Developer Mode)

1. **Clone** this repository or download the ZIP
   ```bash
   git clone https://github.com/Susie-ss/Sky-Scan.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked** → select the `Sky-Scan/` folder
5. Pin the extension icon for quick access 🔌

> **Chrome Web Store**: Coming soon.

### Usage — Table Scraping

| Step | Action |
|------|--------|
| 1 | Navigate to any page with a data table (admin panels, reports, SaaS dashboards) |
| 2 | Click the Sky Scan icon → extension auto-detects all tables on the page |
| 3 | Pick a table from the dropdown, check/uncheck columns |
| 4 | Choose pagination mode (auto-detect works for 90% of sites) |
| 5 | Click **▶ Start** — watch it crawl through every page |
| 6 | Click **⬇ Export** → CSV or JSON |

#### Pagination Modes

| Mode | Behavior | Best for |
|------|----------|----------|
| **Auto-detect** (recommended) | Tries jump-input first, then next-button, then arrow icons | Most paginated tables |
| **Jump to page** | Types the target page number into a pagination input field | Pages with "go to page N" inputs |
| **Next button** | Clicks `>` / `›` / `»` / `Next` buttons | Simple previous/next pagination |
| **Single page** | Scrapes only the current view, no navigation | Dashboards, single-page reports |

#### Advanced Selectors

When auto-detection doesn't work (rare edge cases), use the **Advanced** panel:

```
Next button selector:   .btn-next
Jump input selector:    .pagination input[type="number"]
Table row selector:     .el-table__body tr
Cell selector:          td  (leave blank for auto)
```

### Usage — Article Export

| Step | Action |
|------|--------|
| 1 | Open any blog post, news article, documentation page, or forum thread |
| 2 | Click Sky Scan → switch to **📄 Article** tab |
| 3 | Sky Scan auto-detects the main content body |
| 4 | Review: title, character count, image count, source selector |
| 5 | Click **⬇ Export as Word** → `.docx` file downloads |

---

## 🏗 How It Works

```
Sky-Scan/
├── manifest.json          # Chrome Extension Manifest V3
├── popup.html             # Extension popup UI (370×520px)
├── popup.js               # Core logic (~38KB)
│   ├── detectTablesFn()   # DOM scanning for 5 table types
│   ├── scrapeTableFn()    # Row extraction with 3-level fallback
│   ├── jumpToPageFn()     # Pagination with native input setters
│   ├── detectArticleFn()  # Article body detection heuristics
│   └── generateDocxBlob() # OOXML assembly via JSZip
├── background.js          # Minimal service worker
├── icons/                 # Extension icons (16/48/128 px)
└── vendor/
    └── jszip.min.js       # JSZip v3.10.1 (97KB, DOCX only)
```

### Architecture Decisions

**Why `chrome.scripting.executeScript` instead of content scripts?**
Content scripts defined in `manifest.json` only inject on page load. If the extension is installed *after* the page is already open, content scripts never fire. `scripting.executeScript` injects functions on-demand — reliable every time, regardless of installation timing.

**Why JSZip + AltChunk for DOCX?**
Fake `.doc` files (HTML with `application/msword` MIME) show compatibility warnings in Word. True OOXML (Office Open XML) is a ZIP archive with structured XML — JSZip builds this client-side, and AltChunk embedding ensures Word/WPS natively render the HTML content with proper formatting.

**Why `nativeInputValueSetter` for pagination?**
Modern frameworks (React, Vue) use controlled components that intercept `.value = ` assignments. Calling the native HTMLInputElement setter directly bypasses framework abstractions and updates the internal form state correctly.

---

## 🧪 Technical Deep-Dive

### Table Detection

Sky Scan recognizes **5 table archetypes**:

1. **Native HTML `<table>`** — Standard `<thead>/<tbody>` tables
2. **Element UI** (`.el-table`) — Popular Vue.js component library
3. **Ant Design** (`.ant-table`) — Popular React component library
4. **ARIA grids** (`[role="table"]`, `[role="grid"]`, `[role="treegrid"]`) — Framework-agnostic accessibility tables
5. **Div-based tables** — Custom `div[class*="table-wrap"]` containers used by enterprise dashboards

Each type has its own row selector strategy, and deduplication logic prevents nested tables from being double-counted.

### Pagination Engine

The `jumpToPageFn` implements a 4-level fallback:

```
Level 1: CSS selector matching (`.el-pagination__editor input`, etc.)
Level 2: Narrow input detection (width ≤ 100px inside pagination containers)
Level 3: Text-based input search (placeholder contains "跳", "page", etc.)
Level 4: Find and click ">" / "Next" / "下一页" buttons or SVG icons
```

After setting the page number, it searches for a confirmation button ("确定", "GO", "跳转") and clicks it if found — critical for pagination UIs that don't auto-navigate on input change.

### Article Detection

The `detectArticleFn` uses a 4-tier heuristic:

- **Tier 1 — Semantic HTML**: `<article>` tag (highest confidence)
- **Tier 2 — ARIA landmark**: `[role="main"]` with `>100` non-whitespace characters
- **Tier 3 — Known patterns**: 22 common class/ID selectors (`.article-content`, `.markdown-body`, `#content`, etc.)
- **Tier 4 — Density heuristic**: Iterates all `<div>` and `<section>` elements, scores by `text-length / HTML-length` ratio with bonus for `<p>` tags

---

## 🔒 Privacy & Security

Sky Scan is **100% local-first**. It never sends data to any external server.

- Your browsing data stays in your browser
- Login cookies are reused transparently — no extra authentication needed
- All scraping logic runs in isolated function contexts via `chrome.scripting`
- Only the active tab is accessed at any time (`activeTab` permission)

### Permissions Explained

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access only the tab you're actively using |
| `scripting` | Inject detection & scraping functions into pages |
| `downloads` | Trigger CSV / JSON / DOCX file downloads |
| `storage` | Persist intermediate results across popup sessions |
| `tabs` | Query the current active tab |
| `<all_urls>` | Work on any domain — including enterprise SaaS, internal tools, custom subdomains |

---

## 📋 Comparison

| Feature | Sky Scan | Other Scrapers | Browser DevTools |
|---------|----------|----------------|------------------|
| Zero-code operation | ✅ | ⚠️ Often need regex/XPath | ❌ Manual copy |
| Auto pagination | ✅ 4 modes | ⚠️ Varies | ❌ |
| Column selection UI | ✅ Checkbox UI | ⚠️ | ❌ |
| Article → DOCX | ✅ True .docx | ⚠️ .doc only | ❌ |
| Anti-duplicate detection | ✅ Built-in | ❌ Rare | ❌ |
| El/Ant Design support | ✅ Built-in | ⚠️ | ❌ |
| Works on any domain | ✅ `<all_urls>` | ⚠️ | ✅ |
| Data stays local | ✅ 100% | ❌ Many use cloud | ✅ |
| Free & open-source | ✅ MIT | ⚠️ Many paid | ✅ |

---

## 🛠 Development

### Project Setup

```bash
# Clone the repo
git clone https://github.com/Susie-ss/Sky-Scan.git
cd Sky-Scan
```

### Load in Chrome

1. Go to `chrome://extensions/`
2. Toggle **Developer mode** ON
3. Click **Load unpacked**
4. Select the project root folder

### Modifying

- **popup.js** — All scraping, detection, and export logic
- **popup.html** — UI layout and inline styles
- **manifest.json** — Extension metadata and permissions
- **background.js** — Service worker (minimal, extensible)

No build step. No bundler. Just edit and reload the extension.

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Platform | Chrome Extension Manifest V3 |
| Language | Vanilla JavaScript (ES2020+) |
| DOCX generation | JSZip v3.10.1 |
| Injection | `chrome.scripting.executeScript` |
| Storage | `chrome.storage.local` |
| Downloads | `chrome.downloads` |

---

## 🗺 Roadmap

- [ ] Chrome Web Store publication
- [ ] Firefox / Edge support
- [ ] Scheduled scraping (set & forget)
- [ ] Export to Google Sheets directly
- [ ] Visual table selector (click to pick table on page)
- [ ] OCR support for image-based tables
- [ ] Custom XPath support
- [ ] Theme: dark mode popup

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests.

Before submitting a PR:
1. Test your changes by loading the extension from the modified folder
2. Verify table detection works on at least 3 different websites
3. Keep changes focused — one feature/fix per PR

---

## 📄 License

MIT © Susie-ss

---

<p align="center">
  <sub>Built with ☕ for anyone who's ever manually copy-pasted a 200-page data table.</sub>
</p>
