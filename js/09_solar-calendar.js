// ========================================================
// ماژول تقویم شمسی و آماده‌سازی جلسهٔ امروز

(function createSolarCalendarModule(global) {
  if (global.jalaliDatepicker) {
    global.jalaliDatepicker.startWatch({
      separatorChar: '/',
      changeMonthRotateYear: true
    });
  }

  function dayOfWeek() {
    const days = [
      'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه',
      'پنجشنبه', 'جمعه', 'شنبه'
    ];
    return days[new Date().getDay()];
  }

  function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;
    let days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8
      + Math.floor(((jy % 33) + 3) / 4) + jd
      + (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const gd = days + 1;
    const leap = gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0);
    const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 1;
    let remaining = gd;
    while (remaining > monthDays[gm]) remaining -= monthDays[gm++];
    return { year: gy, month: gm, day: remaining };
  }

  function dayOfWeekFromDate(dateValue) {
    const match = String(dateValue || '').match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!match) return '';
    const { year, month, day } = jalaliToGregorian(Number(match[1]), Number(match[2]), Number(match[3]));
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    return days[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  }

  function updateDayOfWeekFromDate(dateValue) {
    const classItem = AppStore.getSelectedClass();
    const selectedDay = dayOfWeekFromDate(dateValue);
    if (!classItem || !selectedDay) return;
    classItem.session ||= {};
    classItem.session.dayOfWeek = selectedDay;
    if ($('daySelect')) $('daySelect').value = selectedDay;
    AppStore.save();
  }

  function setToday() {
    const classItem = AppStore.getSelectedClass();
    if (!classItem) return;

    classItem.session ||= {};
    const today = jalaliToday();
    if (today) classItem.session.dateJalali = today;
    classItem.session.dayOfWeek = dayOfWeek();

    if ($('sessionNoInput')) {
      $('sessionNoInput').value = global.getSessionNoForDisplay?.(classItem) || classItem.session.sessionNo || '1';
    }
    if ($('dateInput')) $('dateInput').value = classItem.session.dateJalali || '';
    if ($('daySelect')) $('daySelect').value = classItem.session.dayOfWeek || '';
    AppStore.save();
  }

  global.jalaliDayOfWeek = dayOfWeek;
  global.dayOfWeekFromDate = dayOfWeekFromDate;
  global.updateDayOfWeekFromDate = updateDayOfWeekFromDate;
  global.autoSetToday = setToday;
})(window);
