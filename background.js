/* background.js - Service Worker (Manifest V3) */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[万能采集器] 已安装');
});

// 当插件图标被点击时，popup 会被自动激活，无需额外处理
