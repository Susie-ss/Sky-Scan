# ☁️ Sky Scan 数据采集插件

> A universal Chrome extension for scraping web data — tables, articles, and beyond.

Sky Scan is a lightweight yet powerful browser extension that turns any webpage into structured data. Auto-detect tables, navigate pagination, extract articles, and export to CSV, JSON, or DOCX — all without writing a single line of code.

---

## Features

### 📊 Table Scraping (Universal)
- **Auto-detect** — scans for `<table>`, Element UI `.el-table`, Ant Design `.ant-table`, ARIA grids, and custom div-based tables
- **Column selection** — real-time column header preview, toggle individual columns on/off
- **Pagination** — 4 modes: auto-detect, jump-to-page input, next-button click, or single-page
- **Anti-duplicate** — detects stale pages (same first-row key across consecutive pages) and stops gracefully
- **Custom selectors** — advanced mode for manual CSS selector overrides (next button, jump input, table rows, cells)

### 📄 Article Export
- **Smart detection** — 4-tier fallback: `<article>` → `[role="main"]` → 22 known class/id patterns → text-density heuristics
- **Content cleaning** — strips nav, sidebar, footer, ads, comments, breadcrumbs automatically
- **True .docx** — generates OOXML via JSZip, not HTML-masquerading-as-doc. Word & WPS open natively with full formatting

### 📦 Export Formats
| Format | Description |
|--------|-------------|
| **CSV** | UTF-8 BOM, Excel-ready, no garbled Chinese |
| **JSON** | Pretty-printed, full row objects |
| **DOCX** | Native Office Open XML via AltChunk, preserves headings / tables / images / styles |

---

## Installation

### From Source (Developer Mode)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `sky-scan/` folder
5. Pin the extension for quick access

### From Chrome Web Store
> *Coming soon*

---

## Usage

### Table Mode

| Step | Action |
|------|--------|
| 1 | Navigate to any page with a table (data grids, admin panels, reports) |
| 2 | Click the Sky Scan icon — it auto-detects all tables on the page |
| 3 | Select which table + which columns to scrape |
| 4 | Choose pagination mode (auto-detect works for most sites) |
| 5 | Click **▶ Start** — watch it crawl through every page |
| 6 | Click **⬇ Export** → CSV or JSON |

**Pagination modes:**
- **Auto-detect** (recommended) — tries jump-input first, falls back to next-button
- **Jump to page** — types page number into the pagination input field
- **Next button** — clicks `>` / `›` / `»` / `Next` buttons
- **Single page** — scrapes only the current view

**Advanced selectors** (use when auto-detect fails):

```
Next button:    .btn-next
Jump input:     .pagination input[type="number"]
Table row:      .el-table__body tr
```

### Article Mode

| Step | Action |
|------|--------|
| 1 | Open any blog post, news article, or documentation page |
| 2 | Switch to the **📄 Article** tab |
| 3 | Sky Scan auto-detects the main content |
| 4 | Review title, word count, image count |
| 5 | Click **⬇ Export as Word** → `.docx` |

---

## Architecture

```
sky-scan/
├── manifest.json          # Chrome Extension Manifest V3
├── popup.html             # Extension popup UI
├── popup.js               # Core logic (detection, scraping, generation)
├── background.js          # Service worker
├── icons/                 # Extension icons (16/48/128 px)
├── vendor/
│   └── jszip.min.js       # JSZip v3.10.1 (DOCX generation)
└── README.md
```

### How It Works

1. **Detection** — `chrome.scripting.executeScript()` injects scout functions into the active tab. These functions scan the DOM for tables and articles without polluting the page's namespace.

2. **Scraping** — For each page, a scraping function extracts cell data by matching `<th>` headers to row cells. Column order is auto-detected, so rearranged columns still map correctly.

3. **Pagination** — A stateful crawler loop: scrape current page → navigate to next page → verify page changed → repeat. Supports 4 strategies with auto-fallback.

4. **Export** — CSV with BOM (Excel-ready UTF-8), JSON with `JSON.stringify`, and DOCX via JSZip-generated OOXML archive.

---

## Tech Stack

- **Manifest V3** — Chrome's latest extension platform
- **Vanilla JavaScript** — zero dependencies in core logic (JSZip is vendor-bundled for DOCX only)
- **chrome.scripting API** — isolated function injection, no persistent content scripts
- **JSZip v3.10.1** — client-side ZIP/archive generation for DOCX

---

## Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Scrape only the tab you're actively using |
| `scripting` | Inject detection & scraping functions |
| `downloads` | Trigger CSV / JSON / DOCX downloads |
| `storage` | Persist intermediate results across popup sessions |
| `<all_urls>` | Work on any domain (enterprise SaaS, internal tools, etc.) |

---

## Privacy

Sky Scan runs entirely in your browser. No data is ever sent to any server. Login cookies are reused transparently — no additional authentication needed.

---

## License

MIT

---

## Credits

Built for scraping sanity.  
If Sky Scan saves you an hour of manual copy-paste, consider it a success ☁️
