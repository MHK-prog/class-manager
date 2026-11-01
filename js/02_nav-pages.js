// ========================================================
/* #region  تابع ناو بری بین صفحات */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.page === pageId));
  document.body.classList.toggle('session-tracker-open', pageId === 'page-session-tracker');

  if (pageId === 'page-students') window.renderStudentsManage?.();
  if (pageId === 'page-daily') window.initDailyPage?.();
  if (pageId === 'page-report-cards') window.initReportCardPage?.();
  if (pageId === 'page-session-tracker') window.renderSessionTracker?.();
  closeMenu()
  
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => showPage(t.dataset.page));
$('quickExport')?.addEventListener('click', () => showPage('page-export'));

/* #endregion */
// ========================================================


