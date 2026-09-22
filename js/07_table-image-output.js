// ========================================================
// #region [بلوک ۵: خروجی عکس جدول PNG]
function buildExportDom(cls) {
  const stage = $('exportStage');
  if (!stage) return null;
  stage.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'export-title';
  title.textContent = 'جدول ارزشیابی و فعالیت کلاسی';
  stage.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'export-meta';
  meta.innerHTML = `
    <div class="item"><b>کلاس:</b> ${cls.name || ''}</div>
    <div class="item"><b>روز:</b> ${cls.session?.dayOfWeek || ''}</div>
    <div class="item"><b>جلسه:</b> ${cls.session?.sessionNo || ''}</div>
    <div class="item"><b>تاریخ:</b> ${cls.session?.dateJalali || ''}</div>
  `;
  stage.appendChild(meta);

  const table = document.createElement('table');
  table.className = 'export-table';
  const headers = ['ردیف', 'نام و نام خانوادگی', ...SCORE_COLS.map(c => `${c.label} (${c.max})`), 'جمع (۴۰)', 'توضیحات'];
  let tableHtml = '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  const students = cls.students || [];
  const rowCount = Math.max(12, students.length);

  for (let i = 0; i < rowCount; i++) {
    const s = students[i];
    tableHtml += '<tr>';
    tableHtml += `<td>${i + 1}</td>`;
    tableHtml += `<td class="name">${s ? (s.fullName || '') : ''}</td>`;
    SCORE_COLS.forEach(c => {
      const val = s?.scores ? s.scores[c.key] : '';
      tableHtml += `<td>${(val !== undefined && val !== 0) ? val : ''}</td>`;
    });
    tableHtml += `<td><b>${s?.scores ? computeTotal(s.scores) : ''}</b></td>`;
    tableHtml += `<td>${s ? (s.extras?.notes || '') : ''}</td>`;
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody>';
  table.innerHTML = tableHtml;
  stage.appendChild(table);
  return stage;
}

$('btnExportPng')?.addEventListener('click', async () => {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;
  const target = buildExportDom(cls);
  if (!target) return;

  toast('در حال پردازش خروجی...');
  try {
    const canvas = await window.html2canvas(target, { backgroundColor: '#ffffff', scale: 2 });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `فعالیت_کلاس_${cls.name || 'کلاس'}.png`;
    a.click();
    toast('خروجی PNG دانلود شد.');
  } catch (e) {
    toast('خطا در گرفتن خروجی تصویر.');
  } finally {
    target.innerHTML = '';
  }
});
// #endregion
// ========================================================

