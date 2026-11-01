// ========================================================
// هسته داده‌ها و ذخیره‌سازی (KISS & Clean)

const AppStore = {
  key: 'offline_class_grades_v3',
  state: null,

  normalizeState(input) {
    const source = input && typeof input === 'object' ? input : {};
    const classes = Array.isArray(source.classes) ? source.classes : [];

    const normalizedClasses = classes.map(classItem => {
      const cls = classItem && typeof classItem === 'object' ? classItem : {};
      const students = Array.isArray(cls.students) ? cls.students : [];

      return {
        ...this.createClass(cls.name || 'کلاس جدید'),
        ...cls,
        id: cls.id || this.uid(),
        session: { ...this.createClass().session, ...(cls.session || {}) },
        students: students.map(student => {
          const st = student && typeof student === 'object' ? student : {};
          return {
            ...this.createStudent(st.fullName || st.name || ''),
            ...st,
            id: st.id || this.uid(),
            scores: st.scores && typeof st.scores === 'object' ? st.scores : {},
            extras: { notes: '', ...(st.extras || {}) },
            reportCard: {
              ...this.createStudent().reportCard,
              ...(st.reportCard || {}),
              scores: Array.isArray(st.reportCard?.scores)
                ? st.reportCard.scores.slice(0, 11).concat(Array(11).fill('')).slice(0, 11)
                : Array(11).fill('')
            }
          };
        }),
        dailyHistory: Array.isArray(cls.dailyHistory) ? cls.dailyHistory : []
      };
    });

    const resetLegacyHistory = Number(source.version || 0) < 5;
    if (resetLegacyHistory) {
      normalizedClasses.forEach(cls => { cls.dailyHistory = []; });
    }

    const fallback = this.createFreshState();
    const finalClasses = normalizedClasses.length ? normalizedClasses : fallback.classes;
    const selectedClassId = finalClasses.some(c => String(c.id) === String(source.selectedClassId))
      ? source.selectedClassId
      : finalClasses[0].id;

    return {
      version: 5,
      selectedClassId,
      classes: finalClasses
    };
  },

  uid() {
    return 'id_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
  },

  today() {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
    } catch {
      return '';
    }
  },

  createStudent(name) {
    return {
      id: this.uid(),
      fullName: String(name || '').trim(),
      scores: {},
      extras: { notes: '' },
      reportCard: { scores: Array(11).fill(''), teacherDesc: '', supDesc: '' }
    };
  },

  createClass(name = 'کلاس جدید') {
    return {
      id: this.uid(),
      name: String(name).trim(),
      session: { dayOfWeek: '', sessionNo: '1', dateJalali: this.today() },
      students: [],
      dailyHistory: []
    };
  },

  createFreshState() {
    const firstClass = this.createClass('Family St P1');
    return {
      version: 3,
      selectedClassId: firstClass.id,
      classes: [firstClass]
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      this.state = this.normalizeState(raw ? JSON.parse(raw) : null);
    } catch {
      this.state = this.normalizeState(null);
    }
    return this.state;
  },

  replace(nextState) {
    this.state = this.normalizeState(nextState);
    this.save();
    return this.state;
  },

  save() {
    if (!this.state) this.state = this.createFreshState();
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
      const statusEl = document.getElementById('saveStateText');
      if (statusEl) statusEl.textContent = 'V4.5.1';
      return true;
    } catch {
      const statusEl = document.getElementById('saveStateText');
      if (statusEl) statusEl.textContent = 'خطا در ذخیره';
      return false;
    }
  },

  getSelectedClass() {
    if (!this.state?.classes?.length) return null;
    let selected = this.state.classes.find(c => String(c.id) === String(this.state.selectedClassId));
    if (!selected) {
      selected = this.state.classes[0];
      this.state.selectedClassId = selected.id;
    }
    return selected;
  },

  addClass(name) {
    if (!this.state) this.load();
    const newClass = this.createClass(name);
    this.state.classes.push(newClass);
    this.state.selectedClassId = newClass.id;
    this.save();
    return newClass;
  },

  deleteSelectedClass() {
    if (!this.state || this.state.classes.length <= 1) return false;
    this.state.classes = this.state.classes.filter(c => String(c.id) !== String(this.state.selectedClassId));
    this.state.selectedClassId = this.state.classes[0].id;
    this.save();
    return true;
  },

  reset() {
    this.state = this.createFreshState();
    this.save();
    return this.state;
  }
};
