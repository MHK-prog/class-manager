// ========================================================
// #region [بلوک ۳: نمرات روزانه کلاسی]
const SCORE_COLS = [
  { key: 'attendance', label: 'حضور و تأخیر', max: 5 },
  { key: 'homework', label: 'تکالیف', max: 10 },
  { key: 'speaking', label: 'مکالمه', max: 5 },
  { key: 'reading', label: 'روخوانی', max: 5 },
  { key: 'grammar', label: 'گرامر', max: 5 },
  { key: 'dictation', label: 'املا و انشا', max: 5 },
  { key: 'discipline', label: 'انضباط', max: 5 }
];
const TOTAL_MAX = 40;
let dailyCurrentMode = 'student';

function computeTotal(scores) {
  let sum = 0;
  for (const c of SCORE_COLS) {
    const v = Number(scores?.[c.key]);
    if (Number.isFinite(v)) sum += v;
  }
  return Math.min(TOTAL_MAX, Math.max(0, Math.round(sum * 100) / 100));
}

function navDailyStudent(delta) {
  const sel = $('dailyStudentSelect');
  if (!sel || !sel.options.length) return;
  const nextIndex = (sel.selectedIndex + delta + sel.options.length) % sel.options.length;
  sel.selectedIndex = nextIndex;
  renderDailyStudentView();
}

function navDailyField(delta) {
  const sel = $('dailyFieldSelect');
  if (!sel || !sel.options.length) return;
  const nextIndex = (sel.selectedIndex + delta + sel.options.length) % sel.options.length;
  sel.selectedIndex = nextIndex;
  renderDailyFieldView();
}

function initDailyPage() {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;
  const sessionInput = $('sessionNoInput');
  if (sessionInput) {
    sessionInput.value =
      cls.session?.sessionNo || ((cls.dailyHistory || []).length + 1);
  }

  if ($('dailyActiveClassName')) $('dailyActiveClassName').textContent = cls.name || '';

  const fSel = $('dailyFieldSelect');
  if (fSel && fSel.children.length === 0) {
    SCORE_COLS.forEach((f, i) => {
      const opt = document.createElement('option');
      opt.value = f.key;
      opt.textContent = `(${i + 1}/${SCORE_COLS.length}) ${f.label} (${f.max})`;
      fSel.appendChild(opt);
    });
  }

  const sSel = $('dailyStudentSelect');
  if (!sSel) return;
  sSel.innerHTML = '';

  const students = cls.students || [];
  if (students.length === 0) {
    if ($('dailyStudentFormList')) {
      $('dailyStudentFormList').innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted);">ابتدا از تب زبان‌آموزان نام‌ها را وارد کنید.</div>';
    }
    if ($('dailyFieldFormList')) {
      $('dailyFieldFormList').innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted);">ابتدا از تب زبان‌آموزان نام‌ها را وارد کنید.</div>';
    }
    return;
  }

  students.forEach((st, i) => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = `(${i + 1}/${students.length}) ${st.fullName || 'بدون نام'}`;
    sSel.appendChild(opt);
  });

  if (dailyCurrentMode === 'student') renderDailyStudentView();
  else renderDailyFieldView();

  // بررسی اینکه آیا جلسه امروز ثبت شده یا خیر
  const today = jalaliToday();
  if (cls.dailyHistory && cls.dailyHistory.length > 0) {
    const lastSession = cls.dailyHistory[0];
    // اگر امروز با آخرین جلسه فرق داشت، تاریخچه جدید باز کن
    if (lastSession.date !== today) {
      saveDailySession(false);
    }
  }
}

function switchDailyMode(mode) {
  dailyCurrentMode = mode;
  const isStudent = mode === 'student';

  if ($('dailyStudentContainer')) $('dailyStudentContainer').style.display = isStudent ? 'block' : 'none';
  if ($('dailyFieldContainer')) $('dailyFieldContainer').style.display = isStudent ? 'none' : 'block';

  [$('btnDailyModeStudent'), $('btnDailyModeField')].forEach((btn) => {
    if (!btn) return;
    btn.removeAttribute('style');
    btn.className = 'btn';
  });

  if (isStudent) {
    $('btnDailyModeStudent')?.classList.add('primary');
    renderDailyStudentView();
  } else {
    $('btnDailyModeField')?.classList.add('primary');
    renderDailyFieldView();
  }
}

function renderDailyStudentView() {
  const cls = AppStore.getSelectedClass();
  const sSel = $('dailyStudentSelect');
  const formList = $('dailyStudentFormList');
  if (!cls || !sSel || !formList) return;

  const st = cls.students.find(s => s.id === sSel.value);
  if (!st) return;

  formList.innerHTML = '';
  SCORE_COLS.forEach(c => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <label style="font-size:13px; font-weight:bold; color:#334155;">${c.label} (${c.max}):</label>
      <input type="text" inputmode="decimal" class="num" style="width:100px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰" value="${st.scores && st.scores[c.key] !== undefined ? st.scores[c.key] : ''}">
    `;
    const input = row.querySelector('input');
    input.oninput = (e) => {
      const raw = normalizeNumber(e.target.value);
      if (!st.scores) st.scores = {};
      if (raw === '') {
        st.scores[c.key] = 0;
      } else {
        let val = parseFloat(raw);
        if (!Number.isNaN(val)) {
          if (val > c.max) val = c.max;
          if (val < 0) val = 0;
          st.scores[c.key] = val;
        }
      }
      AppStore.save();
      if ($('dailyCurrentTotal')) $('dailyCurrentTotal').textContent = `${computeTotal(st.scores)} / ۴۰`;
    };
    formList.appendChild(row);
  });

  const noteRow = document.createElement('div');
  noteRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
  noteRow.innerHTML = `
    <label style="font-size:13px; font-weight:bold; color:#334155;">توضیحات و یادداشت:</label>
    <input type="text" style="width:180px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;"
           placeholder="اختیاری..." value="${st.extras?.notes || ''}">
  `;
  noteRow.querySelector('input').oninput = (e) => {
    st.extras = st.extras || {};
    st.extras.notes = e.target.value;
    AppStore.save();
  };
  formList.appendChild(noteRow);

  if ($('dailyCurrentTotal')) $('dailyCurrentTotal').textContent = `${computeTotal(st.scores)} / ۴۰`;
}

function renderDailyFieldView() {
  const cls = AppStore.getSelectedClass();
  const fSel = $('dailyFieldSelect');
  const formList = $('dailyFieldFormList');
  if (!cls || !fSel || !formList) return;

  const key = fSel.value;
  const curCol = SCORE_COLS.find(c => c.key === key);
  if (!curCol) return;

  formList.innerHTML = '';
  (cls.students || []).forEach(st => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <span style="font-size:13px; font-weight:bold; color:#334155;">${st.fullName || 'بدون نام'}</span>
      <input type="text" inputmode="decimal" class="num" style="width:100px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${curCol.max}" value="${(st.scores && st.scores[key] !== undefined && st.scores[key] !== 0) ? st.scores[key] : ''}">
    `;
    row.querySelector('input').oninput = (e) => {
      const raw = normalizeNumber(e.target.value);
      if (!st.scores) st.scores = {};
      if (raw === '') {
        st.scores[key] = 0;
      } else {
        let val = parseFloat(raw);
        if (!Number.isNaN(val)) {
          if (val > curCol.max) val = curCol.max;
          if (val < 0) val = 0;
          st.scores[key] = val;
        }
      }
      AppStore.save();
    };
    formList.appendChild(row);
  });
}



$('btnDailyModeStudent')?.addEventListener('click', () => switchDailyMode('student'));
$('btnDailyModeField')?.addEventListener('click', () => switchDailyMode('field'));
$('dailyStudentSelect')?.addEventListener('change', renderDailyStudentView);
$('dailyFieldSelect')?.addEventListener('change', renderDailyFieldView);
// #endregion
// ========================================================

