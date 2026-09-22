

// ========================================================
/* #region  تابع باز و بسته کردن پرده سیاه */

function syncOverlay() {
  const overlay = $('modalOverlay');
  const hasOpenMenu = $('menuDrawer')?.classList.contains('open');
  const hasOpenModal = document.querySelector('.modal.active');
  const hasOpenLayer = Boolean(hasOpenMenu || hasOpenModal);
  if (overlay) overlay.style.display = hasOpenLayer ? 'block' : 'none';
  document.body.classList.toggle('modal-open', hasOpenLayer);
}

/* #endregion */
// ========================================================

// ========================================================
/* #region  توابع باز و بسته کردن مودال*/

function openModal(modalId) {
  const modal = $(modalId);
  if (!modal) return;
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  $('menuDrawer')?.classList.remove('open');
  modal.classList.add('active');
  syncOverlay();
}
function closeModal(modalId) {
  if (modalId) $(modalId)?.classList.remove('active');
  else document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  syncOverlay();
}
function closeAllLayers() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  $('menuDrawer')?.classList.remove('open');
  syncOverlay();
}

/* #endregion */
// ========================================================

// ========================================================
/* #region  گوش به زنگ ها */

// وقتی در کیبورد دکمه esc زده میشه همه مودال ها رو میبنده
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAllLayers(); });

// وقتی روی پرده سیاه کلیک میکنیم اینه که همه چیز رو میبنده
document.addEventListener('DOMContentLoaded', () => {
  $('modalOverlay')?.addEventListener('click', closeAllLayers);
  syncOverlay();
});

function syncKeyboardViewport() {
  const viewport = window.visualViewport;
  const keyboardHeight = viewport
    ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
    : 0;
  document.documentElement.style.setProperty('--keyboard-shift', `${Math.min(keyboardHeight + 12, 180)}px`);
}

window.visualViewport?.addEventListener('resize', syncKeyboardViewport);
window.visualViewport?.addEventListener('scroll', syncKeyboardViewport);
window.addEventListener('resize', syncKeyboardViewport);
syncKeyboardViewport();

/* #endregion */
// ========================================================
