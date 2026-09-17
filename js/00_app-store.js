// ========================================================
// هستهٔ داده و تنها نقطهٔ دسترسی به Local Storage

(function createAppStore(global) {
  const STORAGE_KEY = 'offline_class_grades_v3';
  let state = null;

  function uid() {
    return 'id_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
  }

  function today() {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
    } catch (error) {
      return '';
    }
  }

  function createStudent(name) {
    return {
      id: uid(),
      fullName: String(name || '').trim(),
      scores: {},
      extras: { notes: '' },
      reportCard: {
        scores: Array(11).fill(''),
        teacherDesc: '',
        supDesc: ''
      }
    };
  }

  function createClass(name = 'کلاس ۱') {
    return {
      id: uid(),
      name: String(name).trim() || 'کلاس',
      session: { dayOfWeek: '', sessionNo: '1', dateJalali: today() },
      students: [],
      dailyHistory: []
    };
  }

  function createFreshState() {
    const firstClass = createClass();
    return {
      version: 3,
      selectedClassId: firstClass.id,
      classes: [firstClass]
    };
  }

  function normalizeStudent(student) {
    const source = student && typeof student === 'object' ? student : {};
    return {
      ...createStudent(source.fullName),
      ...source,
      id: source.id || uid(),
      fullName: String(source.fullName || '').trim(),
      scores: source.scores && typeof source.scores === 'object' ? source.scores : {},
      extras: { notes: '', ...(source.extras || {}) },
      reportCard: {
        scores: Array.isArray(source.reportCard?.scores)
          ? [...source.reportCard.scores, ...Array(11).fill('')].slice(0, 11)
          : Array(11).fill(''),
        teacherDesc: typeof source.reportCard?.teacherDesc === 'string' ? source.reportCard.teacherDesc : '',
        supDesc: typeof source.reportCard?.supDesc === 'string' ? source.reportCard.supDesc : ''
      }
    };
  }

  function normalizeClass(classData) {
    const source = classData && typeof classData === 'object' ? classData : {};
    return {
      ...createClass(source.name),
      ...source,
      id: source.id || uid(),
      name: String(source.name || 'کلاس').trim() || 'کلاس',
      session: {
        dayOfWeek: '',
        sessionNo: '1',
        dateJalali: today(),
        ...(source.session || {})
      },
      students: Array.isArray(source.students) ? source.students.map(normalizeStudent) : [],
      dailyHistory: Array.isArray(source.dailyHistory) ? source.dailyHistory : []
    };
  }

  function sanitize(input) {
    if (!input || !Array.isArray(input.classes) || input.classes.length === 0) {
      return createFreshState();
    }

    const classes = input.classes.map(normalizeClass);
    const selectedClassId = classes.some(item => String(item.id) === String(input.selectedClassId))
      ? input.selectedClassId
      : classes[0].id;

    return { ...input, version: 3, selectedClassId, classes };
  }

  function notify(type) {
    if (typeof global.CustomEvent !== 'function') return;
    global.dispatchEvent(new global.CustomEvent('app:state-change', { detail: { type, state } }));
  }

  function load() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      state = raw ? sanitize(JSON.parse(raw)) : createFreshState();
    } catch (error) {
      state = createFreshState();
    }
    notify('load');
    return state;
  }

  function save() {
    if (!state) state = createFreshState();
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const saveStateText = global.document.getElementById('saveStateText');
      if (saveStateText) saveStateText.textContent = 'V4.4';
      notify('save');
      return true;
    } catch (error) {
      const saveStateText = global.document.getElementById('saveStateText');
      if (saveStateText) saveStateText.textContent = 'خطا در ذخیره';
      return false;
    }
  }

  function replace(nextState, persist = true) {
    state = sanitize(nextState);
    if (persist) save();
    else notify('replace');
    return state;
  }

  function reset() {
    state = createFreshState();
    save();
    return state;
  }

  function getSelectedClass() {
    if (!state?.classes?.length) return null;
    let selected = state.classes.find(item => String(item.id) === String(state.selectedClassId));
    if (!selected) {
      selected = state.classes[0];
      state.selectedClassId = selected.id;
    }
    return selected;
  }

  global.AppStore = Object.freeze({
    get key() { return STORAGE_KEY; },
    get state() { return state; },
    uid,
    createStudent,
    createClass,
    createFreshState,
    sanitize,
    load,
    save,
    replace,
    reset,
    getSelectedClass
  });
})(window);
