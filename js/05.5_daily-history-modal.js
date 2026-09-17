// =============================
// #region بخش مودال تاریخچه نمرات روزانه
// تابع ذخیره جلسه (خودکار یا دستی)
function saveDailySession(showNotice = false) {
  const cls = AppStore.getSelectedClass();
  if (!cls || !cls.students?.length) return;

  const today = jalaliToday() || new Date().toLocaleDateString('fa-IR');
  const day = jalaliDayOfWeek?.() || '';

  cls.dailyHistory = cls.dailyHistory || [];

  // کپی سبک و امن از نمرات فعلی دانش‌آموزان
  const currentSnapshot = cls.students.map(st => ({
    id: st.id,
    name: st.fullName,
    scores: { ...(st.scores || {}) },
    total: computeTotal(st.scores),
    notes: st.extras?.notes || ''
  }));

  // بررسی: آیا برای این تاریخ رکوردی هست؟
  const existIndex = cls.dailyHistory.findIndex(h => h.date === today);

  if (existIndex !== -1) {
    // اگر بود، همون رو آپدیت کن
    cls.dailyHistory[existIndex].scores = currentSnapshot;
    cls.dailyHistory[existIndex].day = day;
  } else {
    // اگه تاریخ جدید بود، رکورد جدید اضافه کن
    cls.dailyHistory.unshift({
      date: today,
      day: day,
      scores: currentSnapshot
    });
  }

  AppStore.save();
  if (showNotice) alert(`جلسه مورخ ${today} با موفقیت در تاریخچه ذخیره شد.`);
}

// باز کردن مودال تاریخچه
function openDailyHistoryModal() {
  const cls = AppStore.getSelectedClass();
  const list = $('dailyHistoryList');
  if (!cls || !list) return;

  const history = cls.dailyHistory || [];
  if (history.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:30px; color:var(--muted);">هنوز هیچ جلسه‌ای در تاریخچه ثبت نشده است.</div>';
  } else {
    list.innerHTML = history.map((h, i) => `
      <details style="margin-bottom:10px; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; background:#f8fafc;">
        <summary style="cursor:pointer; font-weight:bold; color:#0f172a; display:flex; justify-content:space-between; align-items:center;">
          <span>🗓️ ${h.date} (${h.day || 'نامشخص'})</span>
          <span style="font-size:12px; color:#0284c7;">${h.scores.length} نفر ثبت‌شده</span>
        </summary>
        <div style="margin-top:10px; border-top:1px dashed #cbd5e1; padding-top:8px;">
          ${h.scores.map(s => `
            <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:13px; border-bottom:1px solid #f1f5f9;">
              <span>${s.name}</span>
              <span style="font-weight:bold; color:#0284c7;">مجموع: ${s.total} / ۴۰</span>
            </div>
          `).join('')}
        </div>
      </details>
    `).join('');
  }

  // modal.style.display = 'flex';
  openModal('dailyHistoryModal');
}

// function closeDailyHistoryModal() {
//   closeModal('dailyHistoryModal')
// }
// #endregion
// =============================

