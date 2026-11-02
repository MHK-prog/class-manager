// Export only the three grades available to teachers for the CMM report-card app.
(function cmmGradeExportModule(global) {
  const allowedGrades = [
    { key: 'classActivity', scoreIndex: 0, max: 40 },
    { key: 'midterm', scoreIndex: 4, max: 40 },
    { key: 'discipline', scoreIndex: 5, max: 10 }
  ];

  function score(value, max) {
    const normalized = normalizeNumber(value);
    if (normalized === '') return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(0, parsed)) : null;
  }

  function safeName(value) {
    return String(value || 'class').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').slice(0, 70) || 'class';
  }

  function exportGrades() {
    const classItem = AppStore.getSelectedClass();
    if (!classItem) return toast('ابتدا یک کلاس انتخاب کنید.');
    const payload = {
      format: 'cmm-grade-import',
      schemaVersion: 1,
      source: 'class-manager',
      class: {
        id: classItem.id,
        name: classItem.name || 'کلاس',
        sessionNumber: classItem.session?.sessionNo || '1',
        dateJalali: classItem.session?.dateJalali || ''
      },
      students: (classItem.students || []).map(student => ({
        id: student.id,
        name: student.fullName || '',
        teacherScores: Object.fromEntries(allowedGrades.map(grade => [
          grade.key,
          { score: score(student.reportCard?.scores?.[grade.scoreIndex], grade.max), max: grade.max }
        ]))
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cmm-grades-${safeName(classItem.name)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('فایل نمرات مجاز برای تکمیل در CMM دانلود شد.');
  }

  global.exportCmmGrades = exportGrades;
  document.getElementById('btnExportCmmGrades')?.addEventListener('click', exportGrades);
})(window);
