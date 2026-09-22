// =============================
// ذخیره کامل وضعیت نمرات امروز
function saveDailySession(showNotice = false) {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.students?.length) return;

  const today = (typeof jalaliToday === 'function' ? jalaliToday() : '') || new Date().toLocaleDateString('fa-IR');
  const day = (typeof jalaliDayOfWeek === 'function' ? jalaliDayOfWeek() : '') || '';

  cls.dailyHistory = cls.dailyHistory || [];

  // کپی کامل از دانش‌آموزان به همراه تمام نمرات
  const fullSnapshot = JSON.parse(JSON.stringify(cls.students));

  const existIndex = cls.dailyHistory.findIndex(h => h.date === today);

  if (existIndex !== -1) {
    cls.dailyHistory[existIndex].students = fullSnapshot;
    cls.dailyHistory[existIndex].day = day;
  } else {
    cls.dailyHistory.unshift({
      date: today,
      day: day,
      students: fullSnapshot
    });
  }

  AppStore.save();
  if (showNotice) alert(`جلسه مورخ ${today} ذخیره شد.`);
}

// Hidden history override: every date owns an independent editable snapshot.
let activeDailyHistoryDate = null;

function cloneDailyStudents(students) {
  return JSON.parse(JSON.stringify(students || []));
}

function getDailyHistoryDate(cls, date) {
  return String(date || cls?.session?.dateJalali || (typeof jalaliToday === 'function' ? jalaliToday() : '')).trim();
}

function saveDailySession(showNotice = false, dateOverride = null) {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.students?.length) return;
  window.commitPendingSessionNumber?.(cls);
  const date = getDailyHistoryDate(cls, dateOverride || activeDailyHistoryDate);
  if (!date) return;

  cls.dailyHistory = cls.dailyHistory || [];
  const record = {
    date,
    day: cls.session?.dayOfWeek || (typeof jalaliDayOfWeek === 'function' ? jalaliDayOfWeek() : ''),
    sessionNo: String(cls.session?.sessionNo || '1'),
    students: cloneDailyStudents(cls.students)
  };
  const index = cls.dailyHistory.findIndex(item => item.date === date);
  if (index >= 0) cls.dailyHistory[index] = record;
  else cls.dailyHistory.unshift(record);
  AppStore.save();
  if (showNotice) toast?.(`نمرات تاریخ ${date} ذخیره شد.`);
}

function getLatestDailySessionNumber(cls) {
  return Math.max(0, ...(cls?.dailyHistory || []).map(item => Number(item.sessionNo) || 0));
}

function getNextDailySessionNumber(cls) {
  return getLatestDailySessionNumber(cls) + 1;
}

function loadDailySessionForDate(date) {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;
  const targetDate = getDailyHistoryDate(cls, date);
  if (!targetDate) return;

  const saved = (cls.dailyHistory || []).find(item => item.date === targetDate);
  if (saved?.students?.length) {
    cls.students = cloneDailyStudents(saved.students);
  } else {
    cls.students = (cls.students || []).map(student => ({
      ...student,
      scores: {},
      extras: { ...(student.extras || {}), notes: '' }
    }));
  }

  activeDailyHistoryDate = targetDate;
  cls.session ||= {};
  cls.session.dateJalali = targetDate;
  AppStore.save();
}

function handleDailyDateChange(date) {
  const cls = AppStore.getSelectedClass();
  const nextDate = String(date || '').trim();
  if (!cls || !nextDate || nextDate === activeDailyHistoryDate) return;
  cls.session ||= {};
  cls.session.dateJalali = nextDate;
  loadDailySessionForDate(nextDate);
  if (typeof initDailyPage === 'function') initDailyPage();
}

function restoreDailySession(date) {
  loadDailySessionForDate(date);
  if (typeof initDailyPage === 'function') initDailyPage();
}

// Compatibility hook; the history remains intentionally hidden.
function openDailyHistoryModal() {}

window.saveDailySession = saveDailySession;
window.loadDailySessionForDate = loadDailySessionForDate;
window.handleDailyDateChange = handleDailyDateChange;
window.getLatestDailySessionNumber = getLatestDailySessionNumber;
window.getNextDailySessionNumber = getNextDailySessionNumber;

// تابع جادویی: بازگردانی نمرات به یک تاریخ خاص
function restoreDailySession(date) {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.dailyHistory) return;

  const targetSession = cls.dailyHistory.find(h => h.date === date);
  if (!targetSession) return;

  const ok = confirm(`آیا می‌خواهید نمرات به تاریخ ${date} بازگردانده شود؟ (نمرات فعلی جایگزین خواهند شد)`);
  if (!ok) return;

  // بازگرداندن نمرات
  cls.students = JSON.parse(JSON.stringify(targetSession.students));
  AppStore.save();

  // رندر مجدد صفحه
  if (typeof render === 'function') render();
  if (typeof refreshDependents === 'function') refreshDependents();

  closeModal('dailyHistoryModal');
  toast?.(`نمرات تاریخ ${date} بازگردانده شد.`);
}

// باز کردن مودال همراه با دکمه بازگردانی
function openDailyHistoryModal() {
  const cls = AppStore.getSelectedClass();
  const list = document.getElementById('dailyHistoryList');
  if (!cls || !list) return;

  const history = cls.dailyHistory || [];
  if (history.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:30px; color:var(--muted);">هنوز هیچ جلسه‌ای در تاریخچه ثبت نشده است.</div>';
  } else {
    list.innerHTML = history.map(h => {
      const students = h.students || h.scores || [];
      return `
        <details style="margin-bottom:10px; border:1px solid #e2e8f0; border-radius:8px; padding:10px; background:#f8fafc;">
          <summary style="cursor:pointer; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
            <span>🗓️ ${h.date} (${h.day || 'نامشخص'})</span>
            <span style="font-size:12px; color:#0284c7;">${students.length} دانش‌آموز</span>
          </summary>
          
          <div style="margin-top:10px; border-top:1px dashed #cbd5e1; padding-top:8px;">
            <div style="margin-bottom:10px; text-align:left;">
              <button type="button" class="btn primary" style="font-size:12px; padding:4px 10px;" onclick="restoreDailySession('${h.date}')">
                🔄 بازگردانی این روز
              </button>
            </div>
            ${students.map(s => `
              <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px; border-bottom:1px solid #f1f5f9;">
                <span>${s.fullName || s.name}</span>
                <span style="font-weight:bold; color:#0284c7;">مجموع: ${typeof computeTotal === 'function' ? computeTotal(s.scores) : (s.total || 0)}</span>
              </div>
            `).join('')}
          </div>
        </details>
      `;
    }).join('');
  }

  openModal('dailyHistoryModal');
}

// Final overrides: history is stored internally and never shown in the UI.
function getLatestDailySessionNumber(cls) {
  return Math.max(0, ...(cls?.dailyHistory || []).map(item => Number(item.sessionNo) || 0));
}

function getNextDailySessionNumber(cls) {
  return getLatestDailySessionNumber(cls) + 1;
}

function saveDailySession(showNotice = false, dateOverride = null) {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.students?.length) return;
  window.commitPendingSessionNumber?.(cls);
  const date = getDailyHistoryDate(cls, dateOverride || activeDailyHistoryDate);
  if (!date) return;
  cls.dailyHistory = cls.dailyHistory || [];
  const record = {
    date,
    day: cls.session?.dayOfWeek || (typeof jalaliDayOfWeek === 'function' ? jalaliDayOfWeek() : ''),
    sessionNo: String(cls.session?.sessionNo || '1'),
    students: cloneDailyStudents(cls.students)
  };
  const index = cls.dailyHistory.findIndex(item => item.date === date);
  if (index >= 0) cls.dailyHistory[index] = record;
  else cls.dailyHistory.unshift(record);
  AppStore.save();
  if (showNotice) toast?.(`نمرات تاریخ ${date} ذخیره شد.`);
}

function loadDailySessionForDate(date) {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;
  const targetDate = getDailyHistoryDate(cls, date);
  if (!targetDate) return;
  const saved = (cls.dailyHistory || []).find(item => item.date === targetDate);
  if (saved?.students?.length) {
    cls.students = cloneDailyStudents(saved.students);
  } else {
    cls.students = (cls.students || []).map(student => ({
      ...student,
      scores: {},
      extras: { ...(student.extras || {}), notes: '' }
    }));
  }
  activeDailyHistoryDate = targetDate;
  cls.session ||= {};
  cls.session.dateJalali = targetDate;
  AppStore.save();
}

function handleDailyDateChange(date) {
  const cls = AppStore.getSelectedClass();
  const nextDate = String(date || '').trim();
  if (!cls || !nextDate || nextDate === activeDailyHistoryDate) return;
  cls.session ||= {};
  cls.session.dateJalali = nextDate;
  loadDailySessionForDate(nextDate);
  if (typeof initDailyPage === 'function') initDailyPage();
}

function restoreDailySession(date) {
  loadDailySessionForDate(date);
  if (typeof initDailyPage === 'function') initDailyPage();
}

function openDailyHistoryModal() {}

window.saveDailySession = saveDailySession;
window.loadDailySessionForDate = loadDailySessionForDate;
window.handleDailyDateChange = handleDailyDateChange;
window.getLatestDailySessionNumber = getLatestDailySessionNumber;
window.getNextDailySessionNumber = getNextDailySessionNumber;
