// ========================================================
// ماژول مدیریت کلاس‌ها و اطلاعات جلسه

(function createClassesModule(global) {
  function getState() {
    return AppStore.state;
  }

  function selectedClass() {
    return AppStore.getSelectedClass();
  }

  function refreshDependents() {
    global.renderStudentsManage?.();
    global.initDailyPage?.();
    global.initReportCardPage?.();
  }

  function render() {
    const currentState = getState();
    if (!currentState) return;

    const select = $('classSelect');
    const count = $('classesCount');
    if (count) count.textContent = `${currentState.classes.length} کلاس`;

    if (select) {
      select.replaceChildren();
      currentState.classes.forEach((classItem, index) => {
        const option = new Option(`${index + 1} — ${classItem.name || 'کلاس'}`, classItem.id);
        option.selected = String(classItem.id) === String(currentState.selectedClassId);
        select.appendChild(option);
      });
    }

    const classItem = selectedClass();
    if (!classItem) return;
    classItem.session ||= {};

    if ($('daySelect')) $('daySelect').value = classItem.session.dayOfWeek || '';
    if ($('sessionNoInput')) {
      $('sessionNoInput').value = classItem.session.sessionNo || ((classItem.dailyHistory || []).length + 1);
    }
    if ($('dateInput')) $('dateInput').value = classItem.session.dateJalali || '';
    if ($('dailyActiveClassName')) $('dailyActiveClassName').textContent = classItem.name || '';
    if ($('rcActiveClassName')) $('rcActiveClassName').textContent = classItem.name || '';
  }

  function updateSessionField(field, value) {
    const classItem = selectedClass();
    if (!classItem) return;
    classItem.session ||= {};
    classItem.session[field] = value;
    AppStore.save();
  }

  function create(name) {
    const currentState = getState();
    if (!currentState) return;

    const classItem = AppStore.createClass(name);
    currentState.classes.push(classItem);
    currentState.selectedClassId = classItem.id;
    AppStore.save();
    render();
    refreshDependents();
    closeModal('addClassModal');
    toast('کلاس اضافه شد.');
  }

  function rename(name) {
    const classItem = selectedClass();
    if (!classItem) return toast('ابتدا یک کلاس را انتخاب کنید.');
    const nextName = String(name || '').trim();
    if (!nextName) return toast('نام جدید را وارد کنید.');
    if (nextName === classItem.name) return closeModal('renameClassModal');

    classItem.name = nextName;
    AppStore.save();
    render();
    refreshDependents();
    closeModal('renameClassModal');
    toast('نام کلاس تغییر کرد.');
  }

  function removeSelected() {
    const currentState = getState();
    if (!currentState || currentState.classes.length <= 1) {
      return toast('حداقل یک کلاس باید باقی بماند.');
    }
    if (!confirm('آیا از حذف این کلاس مطمئن هستید؟')) return;

    currentState.classes = currentState.classes.filter(
      classItem => String(classItem.id) !== String(currentState.selectedClassId)
    );
    currentState.selectedClassId = currentState.classes[0].id;
    AppStore.save();
    render();
    refreshDependents();
    toast('کلاس حذف شد.');
  }

  global.ClassesModule = Object.freeze({ render, create, rename, removeSelected, updateSessionField });
  global.renderClasses = render;

  $('classSelect')?.addEventListener('change', event => {
    const currentState = getState();
    if (!currentState) return;
    currentState.selectedClassId = event.target.value;
    AppStore.save();
    render();
    refreshDependents();
  });

  $('daySelect')?.addEventListener('change', event => updateSessionField('dayOfWeek', event.target.value));
  $('sessionNoInput')?.addEventListener('input', event => updateSessionField('sessionNo', event.target.value));
  $('dateInput')?.addEventListener('input', event => updateSessionField('dateJalali', event.target.value));
  $('dateInput')?.addEventListener('change', event => updateSessionField('dateJalali', event.target.value));
  $('btnDeleteClass')?.addEventListener('click', removeSelected);
})(window);
