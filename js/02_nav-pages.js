// ========================================================
/* #region  تابع ناو بری بین صفحات */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.page === pageId));

  if (pageId === 'page-students') window.renderStudentsManage?.();
  if (pageId === 'page-daily') window.initDailyPage?.();
  if (pageId === 'page-report-cards') window.initReportCardPage?.();
  closeMenu()
  
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => showPage(t.dataset.page));
$('quickStudents')?.addEventListener('click', () => showPage('page-students'));
$('quickExport')?.addEventListener('click', () => showPage('page-export'));

/* #endregion */
// ========================================================


