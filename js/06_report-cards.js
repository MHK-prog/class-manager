// ========================================================
// #region [بلوک ۴: سیستم کارنامه‌ها]
const RC_FIELDS = [
  { key: 'classActivity', label: 'فعالیت کلاسی (۴۰)', max: 40, scoreIndex: 0 },
  { key: 'speaking', label: 'مکالمه (۲۰)', max: 20, scoreIndex: 1 },
  { key: 'reading', label: 'خواندن (۲۰)', max: 20, scoreIndex: 2 },
  { key: 'homework', label: 'تکلیف (۲۰)', max: 20, scoreIndex: 3 },
  { key: 'midterm', label: 'میان‌ترم (۴۰)', max: 40, scoreIndex: 4 },
  { key: 'discipline', label: 'انضباط (۱۰)', max: 10, scoreIndex: 5 },
  { key: 'listening', label: 'شنیداری (۱۰)', max: 10, scoreIndex: 6 },
  { key: 'vocabulary', label: 'واژگان (۱۰)', max: 10, scoreIndex: 7 },
  { key: 'spelling', label: 'املا (۱۰)', max: 10, scoreIndex: 8 },
  { key: 'grammar', label: 'دستور زبان (۱۰)', max: 10, scoreIndex: 9 },
  { key: 'writing', label: 'نوشتن (۱۰)', max: 10, scoreIndex: 10 }
];

let rcCurrentMode = 'student';

function ensureReportCard(st) {
  if (!st.reportCard) st.reportCard = {};
  if (!Array.isArray(st.reportCard.scores)) st.reportCard.scores = Array(11).fill('');
  if (typeof st.reportCard.teacherDesc !== 'string') st.reportCard.teacherDesc = '';
  delete st.reportCard.supDesc;
}

function escapeRcHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function getRcTotal(st) {
  ensureReportCard(st);
  return RC_FIELDS.reduce((sum, field) => sum + (parseFloat(normalizeNumber(st.reportCard.scores[field.scoreIndex])) || 0), 0);
}

function updateRcTotal(st) {
  if (!st) return;
  const sum = getRcTotal(st);
  if ($('rcCurrentTotal')) $('rcCurrentTotal').textContent = String(sum);
}

function switchRcMode(mode) {
  rcCurrentMode = mode;
  const isStudent = mode === 'student';

  if ($('rcStudentContainer')) $('rcStudentContainer').style.display = isStudent ? 'block' : 'none';
  if ($('rcFieldContainer')) $('rcFieldContainer').style.display = isStudent ? 'none' : 'block';

  [$('btnRcModeStudent'), $('btnRcModeField')].forEach((btn) => {
    btn?.classList.remove('primary');
  });

  if (isStudent) {
    $('btnRcModeStudent')?.classList.add('primary');
    renderRcStudentView();
  } else {
    $('btnRcModeField')?.classList.add('primary');
    renderRcFieldView();
  }
}

function navRcStudent(delta) {
  const sel = $('rcStudentSelect');
  if (!sel || !sel.options.length) return;
  const nextIndex = (sel.selectedIndex + delta + sel.options.length) % sel.options.length;
  sel.selectedIndex = nextIndex;
  renderRcStudentView();
}

function navRcField(delta) {
  const sel = $('rcFieldSelect');
  if (!sel || !sel.options.length) return;
  const nextIndex = (sel.selectedIndex + delta + sel.options.length) % sel.options.length;
  sel.selectedIndex = nextIndex;
  renderRcFieldView();
}

function initReportCardPage() {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;

  if ($('rcActiveClassName')) $('rcActiveClassName').textContent = cls.name || '';

  const students = cls.students || [];

  // ۱. دراپ‌دان دانش‌آموزان
  const sSel = $('rcStudentSelect');
  if (sSel) {
    sSel.innerHTML = '';
    students.forEach((st, i) => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `(${i + 1}/${students.length}) ${st.fullName || 'بدون نام'}`;
      sSel.appendChild(opt);
    });
  }

  // ۲. دراپ‌دان فیلدهای کارنامه
  const fSel = $('rcFieldSelect');
  if (fSel && fSel.children.length === 0) {
    RC_FIELDS.forEach((f, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = f.label;
      fSel.appendChild(opt);
    });
  }

  // ۳. تنظیم ذخیره‌سازی خودکار سراسری (فقط یک‌بار)
  const rcBox = $('page-report-cards') || $('rcStudentContainer')?.parentElement;
  if (rcBox && !rcBox.dataset.listenerBound) {
    rcBox.dataset.listenerBound = 'true';
    rcBox.addEventListener('input', (e) => {
      const currentCls = AppStore.getSelectedClass();
      if (!currentCls) return;

      const studentId = e.target.dataset.studentId;
      const st = (currentCls.students || []).find(s => s.id === studentId);
      if (!st) return;
      ensureReportCard(st);

      if (e.target.classList.contains('rc-student-meta')) {
        const field = e.target.dataset.studentField;
        if (field === 'fatherName' || field === 'nationalId') {
          st[field] = e.target.value;
          AppStore.save();
        }
      }

      // الف) تغییر نمرات کارنامه
      if (e.target.classList.contains('rc-input')) {
        const idx = parseInt(e.target.dataset.fieldIndex, 10);
        const f = RC_FIELDS.find(field => field.scoreIndex === idx);
        const raw = normalizeNumber(e.target.value.trim());

        if (raw === '') {
          st.reportCard.scores[idx] = '';
        } else {
          const val = parseFloat(raw);
          st.reportCard.scores[idx] = isNaN(val) ? '' : Math.min(f.max, Math.max(0, val));
        }

        AppStore.save();
        if (rcCurrentMode === 'student') updateRcTotal(st);
      }

      // ب) توضیحات معلم
      if (e.target.classList.contains('rc-desc-teacher')) {
        st.reportCard.teacherDesc = e.target.value;
        AppStore.save();
      }

    });
  }

  // ۴. رندر اولیه
  switchRcMode(rcCurrentMode);
}

function renderRcStudentView() {
  const cls = AppStore.getSelectedClass();
  const sSel = $('rcStudentSelect');
  const formList = $('rcStudentFormList');
  if (!cls || !sSel || !formList) return;

  const st = (cls.students || []).find(s => s.id === sSel.value);
  if (!st) {
    formList.innerHTML = '<div style="padding:16px; color:var(--muted); text-align:center;">ابتدا از تب زبان‌آموزان نام‌ها را وارد کنید.</div>';
    return;
  }

  ensureReportCard(st);
  formList.innerHTML = '';

  const identity = document.createElement('div');
  identity.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin-bottom:12px;';
  identity.innerHTML = `
    <label style="font-size:12px; color:#475569;">نام پدر
      <input class="rc-student-meta" data-student-id="${escapeRcHtml(st.id)}" data-student-field="fatherName" value="${escapeRcHtml(st.fatherName || '')}" autocomplete="off" style="display:block; width:100%; margin-top:4px; padding:7px; border:1px solid #cbd5e1; border-radius:6px;">
    </label>
    <label style="font-size:12px; color:#475569;">کد ملی
      <input class="rc-student-meta" data-student-id="${escapeRcHtml(st.id)}" data-student-field="nationalId" inputmode="numeric" value="${escapeRcHtml(st.nationalId || '')}" autocomplete="off" style="display:block; width:100%; margin-top:4px; padding:7px; border:1px solid #cbd5e1; border-radius:6px;">
    </label>`;
  formList.appendChild(identity);

  RC_FIELDS.forEach((f, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <label style="font-size:13px; font-weight:bold; color:#334155;">${escapeRcHtml(f.label)}</label>
      <input type="text" inputmode="decimal" class="num rc-input"
             data-student-id="${escapeRcHtml(st.id)}" data-field-index="${f.scoreIndex}"
             style="width:110px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${f.max}" value="${escapeRcHtml(st.reportCard.scores[f.scoreIndex] ?? '')}">
    `;
    formList.appendChild(row);
  });

  const tRow = document.createElement('div');
  tRow.style.cssText = 'padding:10px 0;';
  tRow.innerHTML = `
    <div style="font-size:13px; font-weight:bold; color:#334155; margin-bottom:6px;">Teacher Description</div>
    <textarea class="rc-desc-teacher" data-student-id="${escapeRcHtml(st.id)}"
              style="width:100%; min-height:70px; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">${escapeRcHtml(st.reportCard.teacherDesc || '')}</textarea>
  `;
  formList.appendChild(tRow);

  updateRcTotal(st);
}

function renderRcFieldView() {
  const cls = AppStore.getSelectedClass();
  const fSel = $('rcFieldSelect');
  const formList = $('rcFieldFormList');
  if (!cls || !fSel || !formList) return;

  const idx = Number(fSel.value);
  const f = RC_FIELDS[idx];
  if (!f) return;

  formList.innerHTML = '';
  (cls.students || []).forEach(st => {
    ensureReportCard(st);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <span style="font-size:13px; font-weight:bold; color:#334155;">${escapeRcHtml(st.fullName || 'بدون نام')}</span>
      <input type="text" inputmode="decimal" class="num rc-input"
             data-student-id="${escapeRcHtml(st.id)}" data-field-index="${f.scoreIndex}"
             style="width:110px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${f.max}" value="${escapeRcHtml(st.reportCard.scores[f.scoreIndex] ?? '')}">
    `;
    formList.appendChild(row);
  });
}

function buildStudentRcString(st) {
  if (!st) return '';
  ensureReportCard(st);
  const scores = RC_FIELDS.map(field => st.reportCard.scores[field.scoreIndex] ?? '');
  return [...scores, (st.reportCard.teacherDesc || '').trim()].join('+');
}

function copyRcString(btn) {
  const cls = AppStore.getSelectedClass();
  const sSel = $('rcStudentSelect');
  if (!cls || !sSel) return;

  const st = (cls.students || []).find(s => s.id === sSel.value);
  if (!st) return;

  const output = buildStudentRcString(st);
  const write = () => navigator.clipboard?.writeText(output);

  Promise.resolve(write()).catch(() => {
    const area = document.createElement('textarea');
    area.value = output;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }).finally(() => {
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = 'کپی شد! ✔';
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
}

function exportClassReportCardsTxt() {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.students || cls.students.length === 0) {
    return toast('زبان‌آموزی در این کلاس وجود ندارد.');
  }

  const lines = cls.students.map(st => `${st.fullName || 'بدون نام'}\t${buildStudentRcString(st)}`);
  const blob = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeClassName = (cls.name || 'کلاس')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_');
  a.href = url;
  a.download = `کارنامه_${safeClassName}.txt`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast('فایل کارنامه‌های کلاس دانلود شد.');
}

$('btnExportRcTxt')?.addEventListener('click', exportClassReportCardsTxt);
$('btnRcModeStudent')?.addEventListener('click', () => switchRcMode('student'));
$('btnRcModeField')?.addEventListener('click', () => switchRcMode('field'));
$('rcStudentSelect')?.addEventListener('change', renderRcStudentView);
$('rcFieldSelect')?.addEventListener('change', renderRcFieldView);
// #endregion
// ========================================================
