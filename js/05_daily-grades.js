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

  // ۱. منطق هوشمند روز جدید / ادامه روز جاری
  const today = typeof jalaliToday === 'function' ? jalaliToday() : new Date().toLocaleDateString('fa-IR');
  const lastSession = cls.dailyHistory?.[0];

  if (lastSession && !globalThis.loadDailySessionForDate) {
    if (lastSession.date !== today) {
      // روز جدید: خالی کردن نمرات جاری
      (cls.students || []).forEach(st => { st.scores = {}; });
      AppStore.save();
    } else if (lastSession.students?.length) {
      // ادامه روز جاری: بازگردانی نمرات ذخیره شده
      cls.students = JSON.parse(JSON.stringify(lastSession.students));
    }
  }

  // ۲. شماره جلسه و نام کلاس
  const activeDate = cls.session?.dateJalali || (typeof jalaliToday === 'function' ? jalaliToday() : '');
  globalThis.loadDailySessionForDate?.(activeDate);

  const sessionInput = $('sessionNoInput');
  if (sessionInput) {
    sessionInput.value = globalThis.getSessionNoForDisplay?.(cls) || cls.session?.sessionNo || '1';
  }
  if ($('dailyActiveClassName')) $('dailyActiveClassName').textContent = cls.name || '';

  // ۳. دراپ‌دان آیتم‌ها (فقط بار اول پر بشه)
  const fSel = $('dailyFieldSelect');
  if (fSel && fSel.children.length === 0) {
    SCORE_COLS.forEach((f, i) => {
      const opt = document.createElement('option');
      opt.value = f.key;
      opt.textContent = `(${i + 1}/${SCORE_COLS.length}) ${f.label} (${f.max})`;
      fSel.appendChild(opt);
    });
  }

  // ۴. دراپ‌دان دانش‌آموزان
  const sSel = $('dailyStudentSelect');
  const students = cls.students || [];

  if (students.length === 0) {
    const emptyMsg = '<div style="text-align:center; padding:20px; color:var(--muted);">ابتدا از تب زبان‌آموزان نام‌ها را وارد کنید.</div>';
    if ($('dailyStudentFormList')) $('dailyStudentFormList').innerHTML = emptyMsg;
    if ($('dailyFieldFormList')) $('dailyFieldFormList').innerHTML = emptyMsg;
    if (sSel) sSel.innerHTML = '';
    return;
  }

  if (sSel) {
    sSel.innerHTML = '';
    students.forEach((st, i) => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `(${i + 1}/${students.length}) ${st.fullName || 'بدون نام'}`;
      sSel.appendChild(opt);
    });
  }

  // ۵. تنظیم ذخیره‌سازی خودکار سراسری (فقط یک‌بار متصل می‌شود)
  const dailyBox = $('page-daily') || $('dailyStudentContainer')?.parentElement;
  if (dailyBox && !dailyBox.dataset.listenerBound) {
    dailyBox.dataset.listenerBound = 'true';
    dailyBox.addEventListener('input', (e) => {
      const currentCls = AppStore.getSelectedClass();
      if (!currentCls) return;

      // الف) تغییر نمرات
      if (e.target.classList.contains('score-input')) {
        const { studentId, key } = e.target.dataset;
        const st = (currentCls.students || []).find(s => s.id === studentId);
        if (!st) return;

        if (!st.scores) st.scores = {};
        const raw = normalizeNumber(e.target.value.trim());
        const col = SCORE_COLS.find(c => c.key === key);
        const maxVal = col ? col.max : 40;

        st.scores[key] = raw === '' ? 0 : Math.min(maxVal, Math.max(0, parseFloat(raw) || 0));
        AppStore.save();

        if ($('dailyCurrentTotal') && dailyCurrentMode === 'student') {
          $('dailyCurrentTotal').textContent = `${computeTotal(st.scores)} / ۴۰`;
        }
      }

      // ب) تغییر یادداشت
      if (e.target.classList.contains('note-input')) {
        const { studentId } = e.target.dataset;
        const st = (currentCls.students || []).find(s => s.id === studentId);
        if (!st) return;

        st.extras = st.extras || {};
        st.extras.notes = e.target.value;
        AppStore.save();
      }
    });
  }

  // ۶. رندر نهایی
  if (dailyCurrentMode === 'student') renderDailyStudentView();
  else renderDailyFieldView();
}

function switchDailyMode(mode) {
  dailyCurrentMode = mode;
  const isStudent = mode === 'student';

  if ($('dailyStudentContainer')) $('dailyStudentContainer').style.display = isStudent ? 'block' : 'none';
  if ($('dailyFieldContainer')) $('dailyFieldContainer').style.display = isStudent ? 'none' : 'block';

  [$('btnDailyModeStudent'), $('btnDailyModeField')].forEach((btn) => {
    btn?.classList.remove('primary');
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

  const st = (cls.students || []).find(s => s.id === sSel.value);
  if (!st) return;

  formList.innerHTML = '';
  SCORE_COLS.forEach(c => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
    row.innerHTML = `
      <label style="font-size:13px; font-weight:bold; color:#334155;">${c.label} (${c.max}):</label>
      <input type="text" inputmode="decimal" class="num score-input"
             data-student-id="${st.id}" data-key="${c.key}"
             style="width:100px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰" value="${st.scores && st.scores[c.key] !== undefined ? st.scores[c.key] : ''}">
    `;
    formList.appendChild(row);
  });

  const noteRow = document.createElement('div');
  noteRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #eee;';
  noteRow.innerHTML = `
    <label style="font-size:13px; font-weight:bold; color:#334155;">توضیحات و یادداشت:</label>
    <input type="text" class="note-input" data-student-id="${st.id}"
           style="width:180px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;"
           placeholder="اختیاری..." value="${st.extras?.notes || ''}">
  `;
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
      <input type="text" inputmode="decimal" class="num score-input"
             data-student-id="${st.id}" data-key="${key}"
             style="width:100px; text-align:center; padding:6px; border:1px solid #cbd5e1; border-radius:6px;"
             placeholder="۰-${curCol.max}" value="${(st.scores && st.scores[key] !== undefined && st.scores[key] !== 0) ? st.scores[key] : ''}">
    `;
    formList.appendChild(row);
  });
}

$('btnDailyModeStudent')?.addEventListener('click', () => switchDailyMode('student'));
$('btnDailyModeField')?.addEventListener('click', () => switchDailyMode('field'));
$('dailyStudentSelect')?.addEventListener('change', renderDailyStudentView);
$('dailyFieldSelect')?.addEventListener('change', renderDailyFieldView);
// #endregion
// ========================================================

// ========================================================
/* #region  تابع پاک کننده اینپوت های صفحه نمرات روزانه */
function clearCurrentInputs() {
  const cls = AppStore.getSelectedClass();
  if (!cls || !confirm('آیا از پاک کردن اطمینان دارید؟')) return;

  if (dailyCurrentMode === 'student') {
    const st = cls.students?.find(s => s.id === $('dailyStudentSelect')?.value);
    if (st) {
      st.scores = {};
      if (st.extras) st.extras.notes = '';
      AppStore.save();
      globalThis.saveDailySession?.(false);
      renderDailyStudentView();
    }
  } else {
    const key = $('dailyFieldSelect')?.value;
    if (key) {
      (cls.students || []).forEach(st => { if (st.scores) delete st.scores[key]; });
      AppStore.save();
      globalThis.saveDailySession?.(false);
      renderDailyFieldView();
    }
  }
}
/* #endregion */
// ========================================================
