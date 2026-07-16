// 可凡 PWA service worker — 供後台與員工兩套可安裝為 App
const CACHE = 'kefan-pwa-v1';
const ASSETS = [
  '/static/pwa/admin-192.png', '/static/pwa/admin-512.png',
  '/static/pwa/staff-192.png', '/static/pwa/staff-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 導覽請求：先連網（確保部署後拿到最新頁面），離線時給簡易提示頁
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => new Response(
        '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<div style="font-family:-apple-system,\'Noto Sans TC\',sans-serif;color:#5d6f74;text-align:center;margin-top:38vh">' +
        '<div style="font-size:38px">📴</div><p style="margin-top:10px">目前離線，恢復網路後請重試</p></div>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      ))
    );
    return;
  }
  // 圖示等靜態資源：快取優先；其餘（含 /api）一律直接連網，不快取避免資料過時
  if (ASSETS.includes(url.pathname)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
