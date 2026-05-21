/* popup.js - 万能网页数据采集器 v2 */
/* 修复：增强 row 查找、分页跳转、错误信息 */

const $ = id => document.getElementById(id);
let stopFlag = false;
let detectedTables = []; // { idx, selector, tableType, columns[], rowCount, paginationHint }

// ==================== 初始化 ====================

chrome.storage.local.get(['collectedData'], res => {
  const data = res.collectedData || [];
  if (data.length > 0) {
    updateCount(data.length);
    $('btnExport').disabled = false;
  }
});

setTimeout(() => autoDetect(), 200);

// ==================== UI ====================
function setStatus(msg) { $('statusBar').textContent = msg; }
function updateCount(n) { $('countLabel').textContent = `已采集：${n} 条`; }
function setProgress(pct) { $('progressBar').style.width = Math.min(100, pct) + '%'; }

// ==================== 自动检测表格 ====================
async function autoDetect() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  setStatus('🔍 正在检测页面表格…');
  $('detectMsg').textContent = '检测中…';

  const tables = await exec(tab.id, detectTablesFn, []);
  detectedTables = tables || [];

  if (!detectedTables.length) {
    setStatus('⚠️ 未检测到表格，请确认页面有数据表格');
    $('detectMsg').textContent = '未找到表格';
    return;
  }

  const n = detectedTables.length;
  $('detectMsg').textContent = `找到 ${n} 个表格，共 ${detectedTables.reduce((s,t)=>s+(t.rowCount||0),0)} 行`;

  const sel = $('tableSelect');
  sel.innerHTML = '';
  detectedTables.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `表格 ${i + 1}: ${t.columns.slice(0,5).join(', ')}${t.columns.length > 5 ? '…' : ''} (${t.rowCount} 行) [${t.tableType}]`;
    sel.appendChild(opt);
  });

  $('tablePicker').style.display = 'block';
  renderColumnCheckboxes(0);

  if (detectedTables[0].paginationHint) {
    $('paginationHint').textContent = `检测到: ${detectedTables[0].paginationHint}`;
  }

  setStatus(`✅ 检测完成！找到 ${n} 个表格`);
}

$('tableSelect').addEventListener('change', function() {
  renderColumnCheckboxes(parseInt(this.value));
  if (detectedTables[this.value] && detectedTables[this.value].paginationHint) {
    $('paginationHint').textContent = `检测到: ${detectedTables[this.value].paginationHint}`;
  } else {
    $('paginationHint').textContent = '';
  }
});

function renderColumnCheckboxes(tableIdx) {
  const grid = $('colGrid');
  const cols = detectedTables[tableIdx] ? detectedTables[tableIdx].columns : [];
  if (!cols.length) { grid.innerHTML = '<span style="color:#999;font-size:11px">无列头，将按序号列采集</span>'; return; }
  grid.innerHTML = cols.map((c, i) =>
    `<label><input type="checkbox" value="${i}" checked /> ${escHtml(c)}</label>`
  ).join('');
}

$('btnCheckAll').addEventListener('click', () => {
  $('colGrid').querySelectorAll('input').forEach(c => c.checked = true);
});
$('btnUncheckAll').addEventListener('click', () => {
  $('colGrid').querySelectorAll('input').forEach(c => c.checked = false);
});
$('btnDetect').addEventListener('click', autoDetect);
$('advToggle').addEventListener('click', function() {
  const panel = $('advPanel');
  panel.classList.toggle('show');
  this.textContent = panel.classList.contains('show') ? '▼ 高级选择器' : '▶ 高级选择器';
});

function getSelectedColumns() {
  return [...$('colGrid').querySelectorAll('input:checked')].map(c => parseInt(c.value));
}

// ==================== 获取表信息 ====================
function getCurrentTableInfo() {
  const idx = parseInt($('tableSelect').value) || 0;
  return detectedTables[idx] || { selector: 'table', tableType: 'table' };
}

// ==================== 注入函数 ====================

/** 检测页面所有表格 */
function detectTablesFn() {
  const results = [];

  const candidates = [
    ...Array.from(document.querySelectorAll('.el-table')).map(el => ({
      el, type: 'el-table',
      getRows() { return this.el.querySelectorAll('.el-table__body tbody tr, .el-table__body-wrapper tbody tr'); },
      getHeader() {
        const ths = this.el.querySelectorAll('.el-table__header thead th, .el-table__header-wrapper thead th');
        return [...ths].map(th => th.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
      }
    })),
    ...Array.from(document.querySelectorAll('.ant-table')).map(el => ({
      el, type: 'ant-table',
      getRows() { return this.el.querySelectorAll('.ant-table-tbody tr, .ant-table-body tbody tr'); },
      getHeader() {
        const ths = this.el.querySelectorAll('.ant-table-thead th, .ant-table-header th');
        return [...ths].map(th => th.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
      }
    })),
    ...Array.from(document.querySelectorAll('table')).map(el => ({
      el, type: 'table',
      getRows() { return this.el.querySelectorAll('tbody tr'); },
      getHeader() {
        const ths = this.el.querySelectorAll('thead th, thead td');
        if (ths.length) return [...ths].map(th => th.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
        const firstRow = this.el.querySelector('tbody tr');
        if (firstRow) return [...firstRow.querySelectorAll('td, th')].map(td => td.innerText.trim().slice(0, 40));
        return [];
      }
    })),
    // 自定义 div 表格: 找有 role="table" / role="grid" 且含多行 div 的结构
    ...Array.from(document.querySelectorAll('[role="table"], [role="treegrid"], [role="grid"]')).map(el => ({
      el, type: 'grid',
      getRows() { return this.el.querySelectorAll('[role="row"], [role="rowgroup"] > div, .ag-row, .ag-body-viewport .ag-row'); },
      getHeader() {
        const hdr = this.el.querySelectorAll('[role="columnheader"], .ag-header-cell');
        return [...hdr].map(th => th.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
      }
    })),
    // 带表头的 div.table 容器
    ...Array.from(document.querySelectorAll(
      'div[class*="table-wrap"], div[class*="tableWrap"], div[class*="table-container"], ' +
      'div[class*="data-table"], div[class*="dataTable"], div[class*="grid-view"]'
    )).map(el => ({
      el, type: 'div-table',
      getRows() {
        return this.el.querySelectorAll('table tbody tr, [role="row"], .table-row, [class*="table-row"], [class*="row-item"]');
      },
      getHeader() {
        return this.getRows().length > 0 ? [...this.getRows()[0].querySelectorAll('td, th, [role="gridcell"]')].map(td => td.innerText.trim().slice(0, 40)) : [];
      }
    }))
  ];

  // 去重：排除被 el-table/ant-table/role grid 包裹的内部 table
  candidates.forEach(c => {
    if (c.type === 'table') {
      if (c.el.closest('.el-table, .ant-table, [role="table"], [role="treegrid"], [role="grid"]')) return;
    }
    if (c.type === 'div-table') {
      if (c.el.closest('.el-table, .ant-table, [role="table"], [role="treegrid"], [role="grid"]')) return;
    }

    const rows = c.getRows();
    if (rows.length < 1) return;

    let columns = c.getHeader();
    if (!columns.length) {
      const firstRow = rows[0];
      if (firstRow) {
        columns = [...firstRow.querySelectorAll('td, th, [role="gridcell"]')].map(td => td.innerText.trim().slice(0, 40));
        // 如果列头看起来像数据（含数字、英文名等），标记为无列头表格
        if (columns.length && /^[\d.,]+$/.test(columns[0])) {
          columns = columns.map((_, i) => `列${i + 1}`);
        }
      }
    }

    // 构建选择器 - 尽量用 data- 属性或 ID
    let selector;
    if (c.el.id) {
      selector = `#${CSS.escape(c.el.id)}`;
    } else {
      // 用 className 组合
      const cls = c.el.className && typeof c.el.className === 'string'
        ? '.' + c.el.className.trim().split(/\s+/).filter(s => s && !s.match(/^\d/)).slice(0, 3).join('.')
        : '';
      if (cls && cls !== '.') {
        selector = `${c.el.tagName.toLowerCase()}${cls}`;
      } else {
        selector = c.el.tagName.toLowerCase();
      }
      // 确保唯一
      if (document.querySelectorAll(selector).length > 1) {
        const all = document.querySelectorAll(selector);
        const idx = Array.from(all).indexOf(c.el);
        if (idx >= 0) {
          selector = `${selector}:nth-of-type(${idx + 1})`;
        }
      }
    }

    results.push({
      idx: results.length,
      selector,
      tableType: c.type,
      columns,
      rowCount: rows.length,
      paginationHint: detectPaginationText()
    });
  });

  function detectPaginationText() {
    const text = document.body.innerText || '';
    const m = text.match(/共\s*(\d+)\s*页/);
    if (m) return `分页 ${m[1]} 页`;
    if (document.querySelector('.el-pagination')) return 'Element UI 分页';
    if (document.querySelector('.ant-pagination')) return 'Ant Design 分页';
    const btn = document.querySelector('[aria-label*="页"], button[class*="pagination"]');
    if (btn) return '检测到翻页组件';
    return '';
  }

  return results;
}

/** 采集当前表格数据 - v2 增强版 */
function scrapeTableFn(tableSelector, colIndices, tableType, rowSelector, cellSelector) {
  const table = document.querySelector(tableSelector);
  if (!table) {
    console.warn('[Scraper] 未找到表格:', tableSelector);
    return [];
  }

  // 根据 tableType 选择行查找策略
  let rowEls;
  if (rowSelector) {
    rowEls = table.querySelectorAll(rowSelector);
  } else {
    // 策略 1: 按类型
    switch (tableType) {
      case 'el-table':
        rowEls = table.querySelectorAll('.el-table__body tbody tr, .el-table__body-wrapper tbody tr');
        break;
      case 'ant-table':
        rowEls = table.querySelectorAll('.ant-table-tbody tr, .ant-table-body tbody tr');
        break;
      case 'grid':
        rowEls = table.querySelectorAll('[role="row"], [role="rowgroup"] > div, .ag-row, .ag-body-viewport .ag-row');
        break;
      case 'div-table':
        rowEls = table.querySelectorAll('table tbody tr, [role="row"], .table-row, [class*="table-row"], [class*="row-item"]');
        break;
      case 'table':
      default:
        rowEls = table.querySelectorAll('tbody tr');
        break;
    }

    // 策略 2: 如果上面没找到，全局 fallback
    if (!rowEls.length) {
      rowEls = table.querySelectorAll('tr, [role="row"], [class*="table-row"], [class*="row-item"], [class*="data-row"]');
    }

    // 策略 3: 最后兜底 - 从整个文档查找
    if (!rowEls.length && table === document.querySelector(tableSelector)) {
      // 如果 tableSelector 是整个页面的表，扩大搜索
      rowEls = document.querySelectorAll(
        'table tbody tr, [role="row"], ' +
        '.el-table__body tbody tr, .ant-table-tbody tr, ' +
        'tr[class*="row"], [class*="table-row"]'
      );
    }
  }

  console.log('[Scraper] tableType:', tableType, 'rows found:', rowEls.length, 'table:', tableSelector);

  const rows = [];
  const getText = el => el ? el.innerText.trim().replace(/\s+/g, ' ') : '';

  rowEls.forEach(tr => {
    const cells = cellSelector
      ? tr.querySelectorAll(cellSelector)
      : tr.querySelectorAll('td, th, [role="gridcell"], [role="cell"]');

    if (!cells.length) return;
    const d = {};
    colIndices.forEach(ci => {
      if (ci < cells.length) {
        d[`col_${ci}`] = getText(cells[ci]);
      }
    });
    if (Object.values(d).some(v => v)) rows.push(d);
  });

  return rows;
}

/** 读取分页信息 */
function getPaginationInfoFn() {
  const text = document.body.innerText || '';
  const pageMatch  = text.match(/共\s*(\d+)\s*页/);
  const totalMatch = text.match(/共\s*([\d,]+)\s*条/);
  const totalPages = pageMatch ? parseInt(pageMatch[1]) : 0;
  const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0;

  let currentPage = 1;
  const active = document.querySelector(
    '.el-pager .active, .el-pager .number.active, ' +
    '.ant-pagination-item-active a, .ant-pagination-item-active, ' +
    '[class*="pagination"] [class*="active"], ' +
    '[class*="pagination"] [class*="current"], ' +
    '[class*="pager"] [class*="active"], ' +
    '[class*="pager"] [class*="current"]'
  );
  if (active) currentPage = parseInt(active.innerText.trim()) || 1;

  return { total, totalPages, currentPage };
}

/**
 * 跳转到指定页 - v2 增强版
 * 返回 'jumped' | 'next' | 'none'
 */
function jumpToPageFn(targetPage, mode, customNextSel, customJumpSel) {
  if (mode === 'none') return 'none';

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;

  // === 策略A：跳至输入框 ===
  if (mode === 'auto' || mode === 'jump') {
    let jumpInput = null;

    // 1) 用户自定义
    if (customJumpSel) {
      jumpInput = document.querySelector(customJumpSel);
    }

    // 2) 自动检测 - CSS 选择器
    if (!jumpInput) {
      const selectors = [
        '.el-pagination__editor input',
        'input[class*="jump"]',
        'input[class*="goto"]',
        'input[placeholder*="跳"]',
        'input[placeholder*="前往"]',
        'input[placeholder*="页"]',
        'input[placeholder*="page"]',
        '[class*="pagination"] input[type="number"]',
        '[class*="pagination"] input[type="text"]',
        '[class*="pager"] input',
        '[class*="pagination"] input:not([type="checkbox"]):not([type="radio"])'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) { jumpInput = el; break; }
      }
    }

    // 3) 分页容器内窄 input
    if (!jumpInput) {
      const areas = document.querySelectorAll('[class*="pagination"], [class*="pager"], [class*="Pagination"], [class*="Pager"]');
      for (const area of areas) {
        for (const inp of area.querySelectorAll('input')) {
          if (inp.type === 'checkbox' || inp.type === 'radio') continue;
          const w = inp.offsetWidth || inp.getBoundingClientRect().width;
          if (w > 0 && w <= 100) { jumpInput = inp; break; }
        }
        if (jumpInput) break;
      }
    }

    // 4) 页面任意窄 input（最后兜底）
    if (!jumpInput) {
      const allInputs = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])');
      for (const inp of allInputs) {
        const w = inp.offsetWidth || inp.getBoundingClientRect().width;
        if (w > 20 && w <= 100) { jumpInput = inp; break; }
      }
    }

    if (jumpInput) {
      // 聚焦
      jumpInput.focus();
      // 清空
      nativeSetter.call(jumpInput, '');
      jumpInput.dispatchEvent(new Event('input', { bubbles: true }));
      // 设值
      nativeSetter.call(jumpInput, String(targetPage));
      jumpInput.dispatchEvent(new Event('input', { bubbles: true }));
      jumpInput.dispatchEvent(new Event('change', { bubbles: true }));

      // 查找附近的"确定"/"GO"/"跳转"按钮并点击
      let confirmBtn = null;
      const nearBtns = jumpInput.closest('[class*="pagination"], [class*="pager"], form, div')
        ? jumpInput.closest('[class*="pagination"], [class*="pager"], form, div').querySelectorAll('button, a, span[class*="btn"]')
        : [];
      for (const btn of nearBtns) {
        const t = btn.innerText.trim();
        if (t === '确定' || t === 'GO' || t === 'Go' || t === '跳转' || t === '前往') {
          confirmBtn = btn; break;
        }
      }
      // 也查兄弟节点
      if (!confirmBtn && jumpInput.parentElement) {
        for (const sib of jumpInput.parentElement.children) {
          if (sib === jumpInput) continue;
          const t = sib.innerText.trim();
          if (t === '确定' || t === 'GO' || t === 'Go' || t === '跳转' || t === '前往') {
            confirmBtn = sib; break;
          }
        }
      }

      if (confirmBtn) {
        confirmBtn.click();
      } else {
        // 没找到按钮，发 Enter + blur 触发
        jumpInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
        jumpInput.dispatchEvent(new KeyboardEvent('keypress',{ key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
        jumpInput.blur();
        jumpInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      return 'jumped';
    }
  }

  // === 策略B：点击下一页按钮 ===
  if (mode === 'auto' || mode === 'next') {
    let nextBtn = null;

    if (customNextSel) {
      nextBtn = document.querySelector(customNextSel);
    }

    if (!nextBtn) {
      // CSS 选择器
      for (const sel of [
        '.el-pagination .btn-next:not(.disabled)',
        '.el-pagination button.btn-next',
        '.ant-pagination-next:not(.ant-pagination-disabled)',
        '.ant-pagination-next',
        'button[aria-label*="下一页"]:not(:disabled)',
        'button[aria-label*="next"]:not(:disabled)',
        '[class*="pagination"] [class*="next"]:not([class*="disabled"])',
        '[class*="pager"] [class*="next"]:not([class*="disabled"])',
        'li.next:not(.disabled)',
      ]) {
        const el = document.querySelector(sel);
        if (el && !el.disabled && !el.classList.contains('disabled')) { nextBtn = el; break; }
      }
    }

    // 文本匹配
    if (!nextBtn) {
      for (const el of document.querySelectorAll('a, button, li, span, div')) {
        if (el.children.length > 2) continue;
        const t = el.innerText.trim();
        if (t === '>' || t === '›' || t === '»' || t === '下一页' || t === 'Next' || t === 'next') {
          if (!el.disabled && !el.classList.contains('disabled')) { nextBtn = el; break; }
        }
      }
    }

    // SVG/Icon 箭头
    if (!nextBtn) {
      nextBtn = document.querySelector(
        'svg[class*="next"], [class*="arrow-right"]:not([class*="disabled"]), ' +
        '[class*="icon-right"]:not([class*="disabled"])'
      );
    }

    if (nextBtn) {
      nextBtn.click();
      // 额外触发 mousedown/mouseup 确保事件绑定
      nextBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      nextBtn.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true }));
      return 'next';
    }
  }

  return 'none';
}

/** 等待表格有数据 */
function waitForTableFn(timeout, rowSelector) {
  return new Promise(resolve => {
    const start = Date.now();
    const check = () => {
      const sel = rowSelector || 'table tbody tr td, .el-table__body tbody tr td, .ant-table-tbody tr td, [role="row"] [role="gridcell"]';
      const rows = document.querySelectorAll(sel);
      if (rows.length > 0) { resolve(true); return; }
      if (Date.now() - start > timeout) { resolve(false); return; }
      setTimeout(check, 300);
    };
    check();
  });
}

/** 调试：返回当前页面的表格 DOM 摘要 */
function debugTableFn(tableSelector, tableType) {
  const table = document.querySelector(tableSelector);
  if (!table) return { error: `未找到选择器: ${tableSelector}` };
  const info = {
    tagName: table.tagName,
    className: table.className,
    id: table.id,
    innerHTML_len: table.innerHTML.length,
    childCount: table.children.length,
    has_tbody: !!table.querySelector('tbody'),
    tr_count: table.querySelectorAll('tr').length,
    td_count: table.querySelectorAll('td').length,
    role_row_count: table.querySelectorAll('[role="row"]').length,
    children_tags: [...table.children].slice(0, 5).map(c => c.tagName + (c.className ? '.' + c.className.split(' ')[0] : '')),
  };
  return info;
}

// ==================== 工具 ====================
async function exec(tabId, fn, args = []) {
  const results = await chrome.scripting.executeScript({ target: { tabId }, func: fn, args });
  return results[0].result;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ==================== 开始采集 ====================
$('btnStart').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) { setStatus('❌ 无法获取当前标签页'); return; }

  const tableIdx     = parseInt($('tableSelect').value) || 0;
  const tableInfo    = detectedTables[tableIdx];
  if (!tableInfo) { setStatus('⚠️ 请先检测表格'); return; }

  const colIndices   = getSelectedColumns();
  if (!colIndices.length) { setStatus('⚠️ 请至少选择一列'); return; }

  const paginationMode = $('paginationMode').value;
  const customNext   = ($('selNext').value || '').trim();
  const customJump   = ($('selJump').value || '').trim();
  const customRow    = ($('selRow').value  || '').trim();
  const customCell   = ($('selCell').value || '').trim();
  const delay        = parseInt($('delay').value)    || 1500;
  let   maxPages     = parseInt($('maxPages').value) || 0;

  stopFlag = false;
  $('btnStart').style.display = 'none';
  $('btnStop').style.display  = '';
  $('btnExport').disabled = true;
  setProgress(0);
  setStatus('⏳ 初始化…');

  await chrome.storage.local.set({ collectedData: [], scrapeRunning: true });

  // 调试信息
  const debugInfo = await exec(tab.id, debugTableFn, [tableInfo.selector, tableInfo.tableType]);
  console.log('[Scraper Debug]', debugInfo);

  let allData = [];
  const seenKeys = new Set();
  let consecutiveFails = 0;

  try {
    // 读取总页数
    let totalPages = 0;
    if (paginationMode !== 'none') {
      const info = await exec(tab.id, getPaginationInfoFn, []);
      totalPages = info.totalPages || 0;
      if (maxPages > 0) totalPages = Math.min(totalPages || maxPages, maxPages);
      else if (totalPages === 0 && maxPages === 0) maxPages = 999999;
      setStatus(`📊 共 ${info.total || '?'} 条，${totalPages || '?'} 页`);
    } else {
      totalPages = 1;
      setStatus('📄 单页采集模式');
    }
    await sleep(500);

    let page = 1;
    const endPage = totalPages > 0 ? totalPages : (maxPages > 0 ? maxPages : 1);

    while (!stopFlag && page <= endPage) {
      setStatus(`⏳ 第 ${page}/${endPage} 页，等待加载…`);

      const loaded = await exec(tab.id, waitForTableFn, [10000, customRow]);
      if (!loaded) {
        setStatus(`⚠️ 第 ${page} 页加载超时（10秒），停止`);
        break;
      }

      // 采集 - 传入 tableType
      const rows = await exec(tab.id, scrapeTableFn, [
        tableInfo.selector, colIndices, tableInfo.tableType, customRow, customCell
      ]);

      if (!rows || !rows.length) {
        setStatus(`⚠️ 第 ${page} 页无数据 (selector: ${tableInfo.selector}, type: ${tableInfo.tableType})`);
        consecutiveFails++;
        if (consecutiveFails >= 3) {
          setStatus(`❌ 连续 3 页无数据，停止。请检查表格选择器和高级选项`);
          break;
        }
      } else {
        consecutiveFails = 0;
        const firstKey = rows[0][Object.keys(rows[0])[0]] || '';
        if (seenKeys.has(firstKey) && firstKey) {
          consecutiveFails++;
          if (consecutiveFails >= 3) {
            setStatus(`⚠️ 连续 3 页首行相同，翻页可能无效，停止`);
            break;
          }
        } else {
          consecutiveFails = 0;
          if (firstKey) seenKeys.add(firstKey);
        }
        allData = allData.concat(rows);
      }

      await chrome.storage.local.set({ collectedData: allData });

      const pct = endPage > 1 ? (page / endPage) * 100 : 0;
      setProgress(pct);
      setStatus(`📄 第 ${page}/${endPage} 页，本页 ${rows ? rows.length : 0} 条，累计 ${allData.length} 条`);
      updateCount(allData.length);

      if (page >= endPage) break;

      // 翻页
      const nextPage = page + 1;
      let jumpOk = false;
      let lastResult = 'none';
      for (let retry = 0; retry < 3; retry++) {
        if (stopFlag) break;
        const result = await exec(tab.id, jumpToPageFn, [
          nextPage, paginationMode, customNext, customJump
        ]);
        lastResult = result;
        if (result !== 'none') { jumpOk = true; break; }
        setStatus(`🔄 翻页失败 (mode=${paginationMode}, result=${result})，重试 ${retry + 1}/3…`);
        await sleep(delay);
      }
      if (!jumpOk) {
        setStatus(`❌ 翻页 ${page}→${nextPage} 失败 (mode=${paginationMode}, last=${lastResult})。请尝试切换分页模式或设置自定义选择器`);
        break;
      }

      page = nextPage;
      await sleep(delay);
    }

    setProgress(100);
    setStatus(`✅ 采集完成！共 ${allData.length} 条，${page} 页`);
    updateCount(allData.length);
    $('btnExport').disabled = false;

  } catch (e) {
    setStatus(`❌ ${e.message}`);
    console.error('[Scraper Error]', e);
  } finally {
    $('btnStop').style.display  = 'none';
    $('btnStart').style.display = '';
    await chrome.storage.local.set({ scrapeRunning: false });
  }
});

// ==================== 停止 ====================
$('btnStop').addEventListener('click', () => {
  stopFlag = true;
  setStatus('⏹ 正在停止…');
});

// ==================== 导出 ====================
$('btnExport').addEventListener('click', async () => {
  const fmt = $('exportFmt').value;
  chrome.storage.local.get(['collectedData'], res => {
    const rows = res.collectedData || [];
    if (!rows.length) { setStatus('⚠️ 暂无数据可导出'); return; }

    const tableIdx = parseInt($('tableSelect').value) || 0;
    const cols = detectedTables[tableIdx] ? detectedTables[tableIdx].columns : [];
    const colNames = Object.keys(rows[0]).map(k => {
      const idx = parseInt(k.replace('col_', ''));
      return cols[idx] || k;
    });

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let content, mime, ext;

    if (fmt === 'json') {
      const renamed = rows.map(r => {
        const o = {};
        Object.keys(r).forEach(k => {
          const idx = parseInt(k.replace('col_', ''));
          o[cols[idx] || k] = r[k];
        });
        return o;
      });
      content = JSON.stringify(renamed, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      const csv = [colNames.join(',')];
      rows.forEach(r => {
        csv.push(colNames.map(h => {
          const val = r[Object.keys(r).find(k => {
            const idx = parseInt(k.replace('col_', ''));
            return (cols[idx] || k) === h;
          })] || '';
          return `"${val.replace(/"/g, '""')}"`;
        }).join(','));
      });
      content = '\uFEFF' + csv.join('\r\n');
      mime = 'text/csv';
      ext = 'csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({ url, filename: `web_scrape_${date}.${ext}`, saveAs: true });
    setStatus(`✅ 已触发下载：web_scrape_${date}.${ext}`);
  });
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ==================== 模式切换 ====================
let currentMode = 'table';
let articleData = null; // { title, textContent, htmlContent, wordCount, imageCount, sourceSelector }

function switchMode(mode) {
  currentMode = mode;
  if (mode === 'article') {
    $('tableSection').style.display = 'none';
    $('articleSection').style.display = '';
    $('modeTable').classList.remove('active');
    $('modeArticle').classList.add('active');
    detectArticle();
  } else {
    $('tableSection').style.display = '';
    $('articleSection').style.display = 'none';
    $('modeTable').classList.add('active');
    $('modeArticle').classList.remove('active');
  }
}

$('modeTable').addEventListener('click', () => switchMode('table'));
$('modeArticle').addEventListener('click', () => switchMode('article'));

// ==================== 文章检测 ====================

/** 注入页面：检测文章 */
function detectArticleFn() {
  // ---- 内容清除：移除导航/侧栏/广告/评论区 ----
  function cleanClone(el) {
    const clone = el.cloneNode(true);
    const remove = clone.querySelectorAll(
      'script, style, noscript, iframe, nav, footer, aside, ' +
      '.nav, .navbar, .sidebar, .side-bar, .aside, ' +
      '.footer, .comment, .comments, .ad, .advertisement, ' +
      '.share, .social, .related-posts, .recommend, ' +
      '.breadcrumb, .pagination, [role="navigation"], ' +
      '.header, .site-header, .menu, .toolbar'
    );
    remove.forEach(r => r.remove());
    return clone;
  }

  // ---- 优先级 1: <article> ----
  const articleTag = document.querySelector('article');
  if (articleTag) {
    const clone = cleanClone(articleTag);
    const h1 = clone.querySelector('h1');
    const title = h1 ? h1.innerText.trim() : (document.title || '');
    const html = clone.innerHTML.trim();
    const text = clone.innerText.trim();
    return {
      title,
      textContent: text,
      htmlContent: html,
      wordCount: text.replace(/\s+/g, '').length,
      imageCount: clone.querySelectorAll('img').length,
      sourceSelector: '<article>'
    };
  }

  // ---- 优先级 2: [role="main"] ----
  const mainRole = document.querySelector('[role="main"]');
  if (mainRole) {
    const clone = cleanClone(mainRole);
    const h1 = clone.querySelector('h1');
    const title = h1 ? h1.innerText.trim() : (document.title || '');
    const html = clone.innerHTML.trim();
    const text = clone.innerText.trim();
    if (text.replace(/\s+/g, '').length > 100) {
      return {
        title,
        textContent: text,
        htmlContent: html,
        wordCount: text.replace(/\s+/g, '').length,
        imageCount: clone.querySelectorAll('img').length,
        sourceSelector: '[role="main"]'
      };
    }
  }

  // ---- 优先级 3: 常见 class/id ----
  const knownSelectors = [
    '.article-content', '.post-content', '.entry-content',
    '.article-body', '.post-body', '.article-detail',
    '.content-body', '.post-article', '.article',
    '.story-body', '.news-content', '#article-content',
    '#content', '#article', '#post-content', '#main-content',
    'main', '.main-content', '.page-content',
    '.markdown-body', '.rich-content', '.detail-content'
  ];
  for (const sel of knownSelectors) {
    try {
      const el = document.querySelector(sel);
      if (!el) continue;
      const clone = cleanClone(el);
      const text = clone.innerText.trim();
      if (text.replace(/\s+/g, '').length > 200) {
        const h1 = clone.querySelector('h1');
        const title = h1 ? h1.innerText.trim() : (document.title || '');
        return {
          title,
          textContent: text,
          htmlContent: clone.innerHTML.trim(),
          wordCount: text.replace(/\s+/g, '').length,
          imageCount: clone.querySelectorAll('img').length,
          sourceSelector: sel
        };
      }
    } catch (_) {}
  }

  // ---- 优先级 4: 文本密度启发式 ----
  let bestEl = null;
  let bestScore = 0;
  const candidates = document.querySelectorAll('div, section');
  candidates.forEach(el => {
    // 跳过太小的和太大的
    const h = el.innerHTML.length;
    if (h < 500 || h > 500000) return;
    const t = el.innerText.trim().replace(/\s+/g, '').length;
    if (t < 300) return;
    const ratio = t / h;
    // 给含 <p> 标签的加分
    const pBonus = el.querySelectorAll('p').length * 0.001;
    const score = ratio + pBonus;
    if (score > bestScore) {
      bestScore = score;
      bestEl = el;
    }
  });

  if (bestEl) {
    const clone = cleanClone(bestEl);
    const h1 = clone.querySelector('h1');
    const title = h1 ? h1.innerText.trim() : (document.title || '');
    return {
      title,
      textContent: clone.innerText.trim(),
      htmlContent: clone.innerHTML.trim(),
      wordCount: clone.innerText.trim().replace(/\s+/g, '').length,
      imageCount: clone.querySelectorAll('img').length,
      sourceSelector: bestEl.tagName + (bestEl.className ? '.' + bestEl.className.split(' ').slice(0,2).join('.') : '') + (bestEl.id ? '#' + bestEl.id : '')
    };
  }

  return null;
}

async function detectArticle() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  $('articleDetectMsg').textContent = '🔍 正在检测文章…';
  $('articleStatusBar').textContent = '检测中…';

  const result = await exec(tab.id, detectArticleFn, []);
  articleData = result;

  if (!result) {
    $('articleDetectMsg').textContent = '⚠️ 未识别到文章内容';
    $('articleStatusBar').textContent = '请确认页面包含正文（如新闻、博客、文档页）';
    $('articleInfo').style.display = 'none';
    $('articleBtnExport').disabled = true;
    return;
  }

  $('articleTitle').textContent = result.title || '(无标题)';
  $('articleWords').textContent = `约 ${result.wordCount} 字`;
  $('articleImages').textContent = `${result.imageCount} 张图片`;
  $('articleSource').textContent = `来源: ${result.sourceSelector}`;
  $('articleInfo').style.display = '';
  $('articleDetectMsg').textContent = `✅ 检测到文章：「${(result.title || '').slice(0, 30)}」`;
  $('articleStatusBar').textContent = '👆 点击「导出为 Word」下载 .docx 文件';
  $('articleBtnExport').disabled = false;
}

$('articleBtnDetect').addEventListener('click', detectArticle);

// ==================== 文章导出为 .docx ====================

/**
 * 构建真正的 .docx（Office Open XML）文件
 * 使用 AltChunk 方式嵌入 HTML，Word/WPS 打开时自动转换为原生格式
 */
async function generateDocxBlob(title, htmlContent) {
  const zip = new JSZip();

  // ---- [Content_Types].xml ----
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/afchunk.mht" ContentType="text/html"/>
</Types>`);

  // ---- _rels/.rels ----
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // ---- word/_rels/document.xml.rels ----
  zip.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.mht"/>
</Relationships>`);

  // ---- word/document.xml ----
  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="rId1"/>
  </w:body>
</w:document>`);

  // ---- word/afchunk.mht（HTML 正文）----
  const safeTitle = escXml(title || '');
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body {
    font-family: "Microsoft YaHei", "PingFang SC", "SimSun", sans-serif;
    font-size: 14px; line-height: 1.8; color: #333;
  }
  h1 { font-size: 22px; font-weight: bold; margin-bottom: 12px; color: #111; }
  h2 { font-size: 18px; font-weight: bold; margin: 16px 0 8px; color: #222; }
  h3 { font-size: 15px; font-weight: bold; margin: 12px 0 6px; }
  h4, h5, h6 { font-size: 14px; font-weight: bold; margin: 8px 0 4px; }
  p { margin: 6px 0; }
  img { max-width: 100%; margin: 8px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  table td, table th { border: 1px solid #999; padding: 6px 8px; font-size: 13px; }
  table th { background: #f0f0f0; font-weight: bold; }
  ul, ol { margin: 6px 0 6px 20px; }
  li { margin: 3px 0; }
  blockquote {
    border-left: 3px solid #ccc; padding: 6px 14px;
    margin: 10px 0; color: #666; background: #fafafa;
  }
  pre, code {
    font-family: "Courier New", monospace;
    background: #f5f5f5; padding: 2px 6px; font-size: 13px;
  }
  pre { padding: 10px; overflow-x: auto; white-space: pre-wrap; }
  a { color: #1a6cff; text-decoration: underline; }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
</style>
</head>
<body>
<h1>${safeTitle}</h1>
${htmlContent}
</body>
</html>`;

  zip.folder('word').file('afchunk.mht', html);

  // 生成 ZIP blob
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

function escXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

$('articleBtnExport').addEventListener('click', async () => {
  if (!articleData) {
    $('articleStatusBar').textContent = '⚠️ 请先检测文章';
    return;
  }

  const fmt = $('articleExportFmt').value;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const safeTitle = (articleData.title || 'article').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50);

  if (fmt === 'docx') {
    $('articleStatusBar').textContent = '⏳ 正在生成 .docx 文件…';
    const blob = await generateDocxBlob(articleData.title, articleData.htmlContent);
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: `${safeTitle}_${date}.docx`,
      saveAs: true
    });
    $('articleStatusBar').textContent = `✅ 已触发下载：${safeTitle}.docx`;
  }
});

// 切换到文章模式时自动触发检测（延迟等 popup 渲染）
setTimeout(() => {
  // 初始化为表格模式
  switchMode('table');
}, 100);
