// Unified layer manager for the side drawer and application modals.
function syncOverlay() {
  const overlay = $('modalOverlay');
  const hasOpenMenu = $('menuDrawer')?.classList.contains('open');
  const hasOpenModal = document.querySelector('.modal.active');
  const hasOpenLayer = Boolean(hasOpenMenu || hasOpenModal);
  if (overlay) overlay.style.display = hasOpenLayer ? 'block' : 'none';
  document.body.classList.toggle('modal-open', hasOpenLayer);
}
function openOverlay() { syncOverlay(); }
function closeOverlay() { syncOverlay(); }
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
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAllLayers(); });
document.addEventListener('DOMContentLoaded', () => {
  $('modalOverlay')?.addEventListener('click', closeAllLayers);
  syncOverlay();
});
