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

  function setToday() {
    const classItem = AppStore.getSelectedClass();
    if (!classItem) return;

    classItem.session ||= {};
    const today = jalaliToday();
    if (today) classItem.session.dateJalali = today;
    classItem.session.dayOfWeek = dayOfWeek();

    const history = classItem.dailyHistory || [];
    const todayIndex = history.findIndex(item => item.date === today);
    classItem.session.sessionNo = todayIndex >= 0 ? history.length - todayIndex : history.length + 1;

    if ($('sessionNoInput')) $('sessionNoInput').value = classItem.session.sessionNo;
    if ($('dateInput')) $('dateInput').value = classItem.session.dateJalali || '';
    if ($('daySelect')) $('daySelect').value = classItem.session.dayOfWeek || '';
    AppStore.save();
  }

  global.SolarCalendarModule = Object.freeze({ dayOfWeek, setToday });
  global.jalaliDayOfWeek = dayOfWeek;
  global.autoSetToday = setToday;
})(window);
