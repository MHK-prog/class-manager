// هربار تغییر اساسی دادی این ورژن رو ببر بالا (مثلا v2, v3)
const CACHE_NAME = 'class-manager-v5';

const urlsToCache = [
  '/class-manager/',
  '/class-manager/index.html',
  '/class-manager/manifest.json',
  '/class-manager/style.css',
  '/class-manager/css/00-base.css',
  '/class-manager/css/01-classes.css',
  '/class-manager/css/02-students.css',
  '/class-manager/css/03-daily-grades.css',
  '/class-manager/css/04-report-cards.css',
  '/class-manager/css/05-export.css',
  '/class-manager/css/base.css',
  '/class-manager/lib/jalalidatepicker.min.css',
  '/class-manager/lib/Vazirmatn.css',
  '/class-manager/lib/font/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
  '/class-manager/lib/font/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
  '/class-manager/lib/font/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
  '/class-manager/lib/html2canvas.min.js',
  '/class-manager/lib/jalalidatepicker.min.js',
  '/class-manager/img/icon-192.webp',
  '/class-manager/img/icon-512.webp',
  '/class-manager/img/logo.webp',
  '/class-manager/js/00_app-store.js',
  '/class-manager/js/00_general.js',
  '/class-manager/js/01_menu-drawer.js',
  '/class-manager/js/02_nav-pages.js',
  '/class-manager/js/03_classes.js',
  '/class-manager/js/04_students.js',
  '/class-manager/js/05_daily-grades.js',
  '/class-manager/js/06_report-cards.js',
  '/class-manager/js/07_table-image-output.js',
  '/class-manager/js/08_data-backup-restore-cleanup.js',
  '/class-manager/js/09_solar-calendar.js',
  '/class-manager/js/modal/00.5_modals.js',
  '/class-manager/js/modal/05.5_daily-history-modal.js',
  '/class-manager/js/modal/05.6_add-class-modal.js',
  '/class-manager/js/modal/05.7_rename-class-modal.js',
  '/class-manager/js/modal/05.8_delete-class-modal.js'
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
