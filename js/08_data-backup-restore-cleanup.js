// ========================================================
// ماژول پشتیبان‌گیری، بازیابی و پاک‌سازی داده‌ها

(function createDataManagementModule(global) {
  function download(content, fileName, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function backup() {
    download(JSON.stringify(AppStore.state, null, 2), 'backup_grades.json', 'application/json');
  }

  async function restore(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      AppStore.replace(JSON.parse(text));
      renderClasses();
      renderStudentsManage?.();
      initDailyPage?.();
      initReportCardPage?.();
      toast('اطلاعات با موفقیت بازیابی شد.');
    } catch (error) {
      toast('فایل پشتیبان معتبر نیست.');
    } finally {
      event.target.value = '';
    }
  }

  function wipe() {
    if (!confirm('آیا مطمئن هستید؟ تمام داده‌ها حذف خواهند شد.')) return;
    AppStore.reset();
    renderClasses();
    renderStudentsManage?.();
    initDailyPage?.();
    initReportCardPage?.();
    toast('تمام اطلاعات ریست شد.');
  }

  $('btnBackup')?.addEventListener('click', backup);
  $('btnRestore')?.addEventListener('click', () => $('restoreFile')?.click());
  $('restoreFile')?.addEventListener('change', restore);
  $('btnWipe')?.addEventListener('click', wipe);
})(window);
