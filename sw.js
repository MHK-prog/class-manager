// هربار تغییر اساسی دادی این ورژن رو ببر بالا (مثلا v2, v3)
const CACHE_NAME = 'class-manager-v10';
const APP_ROOT = self.registration.scope;
const API_PATH = new URL('api/', APP_ROOT).pathname;

const appFiles = [
  '', 'index.html', 'manifest.json',
  'css/00-base.css', 'css/01-classes.css', 'css/02-students.css',
  'css/03-daily-grades.css', 'css/04-report-cards.css', 'css/05-export.css',
  'css/06-session-tracker.css', 'css/base.css',
  'lib/jalalidatepicker.min.css', 'lib/Vazirmatn.css',
  'lib/font/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
  'lib/font/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
  'lib/font/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
  'lib/html2canvas.min.js', 'lib/jalalidatepicker.min.js',
  'img/icon-192.webp', 'img/icon-512.webp', 'img/logo.webp',
  'js/00_app-store.js', 'js/00_general.js', 'js/01_menu-drawer.js',
  'js/02_nav-pages.js', 'js/03_classes.js', 'js/04_students.js',
  'js/05_daily-grades.js', 'js/06_report-cards.js',
  'js/07_table-image-output.js', 'js/08_data-backup-restore-cleanup.js',
  'js/09_solar-calendar.js', 'js/10_session_tracker.js',
  'js/11_report-card-exports.js',
  'js/modal/00.5_modals.js', 'js/modal/05.5_daily-history-modal.js',
  'js/modal/05.6_add-class-modal.js', 'js/modal/05.7_rename-class-modal.js',
  'js/modal/05.8_delete-class-modal.js'
];
const urlsToCache = appFiles.map(file => new URL(file, APP_ROOT).toString());

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

  // داده‌های کلاس و نشست PHP نباید در Cache Storage ذخیره شوند.
  if (new URL(event.request.url).origin === new URL(APP_ROOT).origin && new URL(event.request.url).pathname.startsWith(API_PATH)) return;

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
