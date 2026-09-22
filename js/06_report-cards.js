// ========================================================
// #region [بلوک ۴: سیستم کارنامه‌ها]
const RC_FIELDS = [
  { key: 'cinv', label: 'Class Involvement (40)', max: 40 },
  { key: 'spk', label: 'Speaking (20)', max: 20 },
  { key: 'read', label: 'Reading (20)', max: 20 },
  { key: 'hw', label: 'Homework (20)', max: 20 },
  { key: 'mid', label: 'Midterm (40)', max: 40 },
  { key: 'disc', label: 'Discipline (10)', max: 10 },
  { key: 'list', label: 'Listening (10)', max: 10 },
  { key: 'voc', label: 'Vocabulary (10)', max: 10 },
  { key: 'spel', label: 'Spelling (10)', max: 10 },
  { key: 'gram', label: 'Grammar (10)', max: 10 },
  { key: 'wri', label: 'Writing (10)', max: 10 }
];

let rcCurrentMode = 'student';

function ensureReportCard(st) {
  if (!st.reportCard) st.reportCard = {};
  if (!Array.isArray(st.reportCard.scores)) st.reportCard.scores = Array(RC_FIELDS.length).fill('');
  if (typeof st.reportCard.teacherDesc !== 'string') st.reportCard.teacherDesc = '';
  if (typeof st.reportCard.supDesc !== 'string') st.reportCard.supDesc = '';
}

function getRcTotal(st) {
  ensureReportCard(st);
  return st.reportCard.scores.reduce((acc, v) => acc + (parseFloat(normalizeNumber(v)) || 0), 0);
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

      // الف) تغییر نمرات کارنامه
      if (e.target.classList.contains('rc-input')) {
        const idx = parseInt(e.target.dataset.fieldIndex, 10);
        const f = RC_FIELDS[idx];
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

      // ج) توضیحات سوپروایزر
      if (e.target.classList.contains('rc-desc-sup')) {
        st.reportCard.supDesc = e.target.value;
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

  RC_FIELDS.forEach((f, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <label style="font-size:13px; font-weight:bold; color:#334155;">${f.label}</label>
      <input type="text" inputmode="decimal" class="num rc-input"
             data-student-id="${st.id}" data-field-index="${i}"
             style="width:110px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${f.max}" value="${st.reportCard.scores[i] ?? ''}">
    `;
    formList.appendChild(row);
  });

  const tRow = document.createElement('div');
  tRow.style.cssText = 'padding:10px 0;';
  tRow.innerHTML = `
    <div style="font-size:13px; font-weight:bold; color:#334155; margin-bottom:6px;">Teacher Description</div>
    <textarea class="rc-desc-teacher" data-student-id="${st.id}"
              style="width:100%; min-height:70px; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">${st.reportCard.teacherDesc || ''}</textarea>
    <div style="font-size:13px; font-weight:bold; color:#334155; margin:10px 0 6px;">Supervisor Description</div>
    <textarea class="rc-desc-sup" data-student-id="${st.id}"
              style="width:100%; min-height:70px; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">${st.reportCard.supDesc || ''}</textarea>
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
      <span style="font-size:13px; font-weight:bold; color:#334155;">${st.fullName || 'بدون نام'}</span>
      <input type="text" inputmode="decimal" class="num rc-input"
             data-student-id="${st.id}" data-field-index="${idx}"
             style="width:110px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${f.max}" value="${st.reportCard.scores[idx] ?? ''}">
    `;
    formList.appendChild(row);
  });
}

function buildStudentRcString(st) {
  if (!st) return '';
  ensureReportCard(st);
  const scores = (st.reportCard.scores || []).map(s => (s ?? ''));
  return [...scores, (st.reportCard.teacherDesc || '').trim(), (st.reportCard.supDesc || '').trim()].join('+');
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
    return alert('زبان‌آموزی در این کلاس وجود ندارد!');
  }

  const lines = cls.students.map(st => `${st.fullName || 'بدون نام'}\t${buildStudentRcString(st)}`);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `کارنامه_${(cls.name || 'کلاس').replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}

$('btnRcModeStudent')?.addEventListener('click', () => switchRcMode('student'));
$('btnRcModeField')?.addEventListener('click', () => switchRcMode('field'));
$('rcStudentSelect')?.addEventListener('change', renderRcStudentView);
$('rcFieldSelect')?.addEventListener('change', renderRcFieldView);
// #endregion
// ========================================================
