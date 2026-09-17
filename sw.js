// هربار تغییر اساسی دادی این ورژن رو ببر بالا (مثلا v2, v3)
const CACHE_NAME = 'class-manager-v3';

const urlsToCache = [
  '/class-manager/',
  '/class-manager/index.html',
  '/class-manager/manifest.json',
  '/class-manager/html2canvas.min.js',
  '/class-manager/img/icon-192.png',
  '/class-manager/img/icon-512.png'
];

// 1. نصب و جایگزینی فوری بدون معطلی (Skip Waiting)
self.addEventListener('install', event => {
  self.skipWaiting(); // خیلی مهم: سرویس ورکر قبلی رو فوراً کنار می‌زنه
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. فعال‌سازی و پاکسازی کش‌های قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // سریعاً کنترل تب‌های باز رو به دست می‌گیره
  );
});

// 3. استراتژی هوشمند: اول شبکه، اگر نشد (آفلاین بود) کش
self.addEventListener('fetch', event => {
  // فقط درخواست‌های GET رو مدیریت کن
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // اگر پاسخ از سرور سالم بود، یه کپی ازش می‌فرستیم توی کش که آپدیت بمونه
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // اگر اینترنت نبود یا سرور جواب نداد، کش قبلی رو برگردون (آفلاین کار می‌کنه)
        return caches.match(event.request);
      })
  );
});
