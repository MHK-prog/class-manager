// Fast, offline first daily session evaluation wizard.
(function sessionTrackerModule(global) {
  const page = () => document.getElementById('page-session-tracker');
  const list = () => document.getElementById('trackerStudentList');
  const steps = [
    { title: 'حضور و غیاب', hint: 'برای هر زبان‌آموز وضعیت حضور را با یک لمس مشخص کنید. حاضر: ۵، تأخیر: ۳، غایب: ۱ ستاره.' },
    { title: 'بررسی تکالیف', hint: 'برای هر زبان‌آموز امتیاز تکلیف را از ۱ تا ۵ انتخاب کنید؛ موارد ثبت‌نشده در میانگین وارد نمی‌شوند.' },
    { title: 'پرسش و پاسخ کلاسی', hint: 'فقط زبان‌آموزانی که ارزیابی شده‌اند امتیاز می‌گیرند. امتیاز دادن، «ارزیابی شد» را خودکار فعال می‌کند.' },
    { title: 'املا و آزمون کوتاه', hint: 'برای هر زبان‌آموز امتیاز املا را از ۱ تا ۵ انتخاب کنید؛ اگر املا نداشتید، مرحله را رد کنید.' },
    { title: 'تأیید و ثبت نهایی', hint: 'پیش‌نمایش امتیازهای وزنی را بررسی و جلسه را ثبت کنید؛ سپس JSON یا کارت‌های PNG را دریافت کنید.' }
  ];
  const weights = { attendance: 1, homework: 2, speaking: 1, dictation: 2 };
  const statusStars = { present: 5, late: 3, absent: 1 };
  const statusLabels = { present: 'حاضر', late: 'با تأخیر', absent: 'غایب' };
  let activeSession = null;
  let savedSession = null;

  function selectedClass() {
    return global.AppStore?.getSelectedClass?.() || null;
  }

  function normalizeDraft(draft, classItem) {
    const roster = Array.isArray(draft.students) ? draft.students : [];
    return {
      ...draft,
      sessionId: draft.sessionId || `evaluation_${global.AppStore.uid()}`,
      classId: classItem.id,
      className: draft.className || classItem.name || 'کلاس',
      sessionNo: draft.sessionNo || classItem.session?.sessionNo || '1',
      dateJalali: draft.dateJalali || classItem.session?.dateJalali || global.jalaliToday?.() || '',
      startedAt: draft.startedAt || new Date().toISOString(),
      step: Math.max(0, Math.min(4, Number(draft.step) || 0)),
      skipHomework: Boolean(draft.skipHomework),
      skipDictation: Boolean(draft.skipDictation),
      students: roster.map(student => ({
        studentId: student.studentId || student.id || global.AppStore.uid(),
        name: student.name || student.fullName || '',
        attendanceStatus: ['present', 'late', 'absent'].includes(student.attendanceStatus) ? student.attendanceStatus : 'present',
        homeworkStars: validStars(student.homeworkStars),
        speakingAsked: Boolean(student.speakingAsked),
        speakingStars: validStars(student.speakingStars),
        dictationStars: validStars(student.dictationStars)
      }))
    };
  }

  function validStars(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
  }

  function persistDraft() {
    if (!activeSession) return;
    const classItem = global.AppStore.state?.classes?.find(item => String(item.id) === String(activeSession.classId));
    if (!classItem) return;
    classItem.sessionDraft = activeSession;
    global.AppStore.save();
  }

  function startSession() {
    const classItem = selectedClass();
    if (!classItem) return global.toast?.('ابتدا یک کلاس انتخاب کنید.');
    if (!Array.isArray(classItem.students) || !classItem.students.length) {
      global.toast?.('برای شروع جلسه ابتدا زبان‌آموزان کلاس را ثبت کنید.');
      global.showPage?.('page-students');
      return;
    }

    const existing = classItem.sessionDraft;
    if (existing && String(existing.classId) === String(classItem.id) && Array.isArray(existing.students) && existing.students.length) {
      activeSession = normalizeDraft(existing, classItem);
    } else {
      activeSession = normalizeDraft({
        sessionId: `evaluation_${global.AppStore.uid()}`,
        classId: classItem.id,
        className: classItem.name,
        sessionNo: global.getSessionNoForDisplay?.(classItem) || classItem.session?.sessionNo || '1',
        dateJalali: classItem.session?.dateJalali || global.jalaliToday?.() || '',
        startedAt: new Date().toISOString(),
        step: 0,
        skipHomework: false,
        skipDictation: false,
        students: classItem.students.map(student => ({
          studentId: student.id,
          name: student.fullName || student.name || '',
          attendanceStatus: 'present',
          homeworkStars: null,
          speakingAsked: false,
          speakingStars: null,
          dictationStars: null
        }))
      }, classItem);
      persistDraft();
    }
    savedSession = null;
    global.showPage?.('page-session-tracker');
    render();
  }

  function currentStep() {
    return activeSession ? steps[activeSession.step] : steps[0];
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function actionButton(action, label, className = 'btn ghost') {
    const button = element('button', className, label);
    button.type = 'button';
    button.dataset.trackerAction = action;
    return button;
  }

  function renderProgress() {
    const root = document.getElementById('trackerProgress');
    if (!root) return;
    root.replaceChildren();
    steps.forEach((step, index) => {
      const item = element('div', `session-progress-step${index === activeSession.step ? ' current' : ''}${index < activeSession.step ? ' complete' : ''}`);
      item.setAttribute('aria-current', index === activeSession.step ? 'step' : 'false');
      item.append(element('span', 'session-progress-number', String(index + 1)), element('span', 'session-progress-label', step.title));
      root.appendChild(item);
    });
  }

  function toolbar() {
    const root = document.getElementById('trackerToolbar');
    if (!root) return;
    root.replaceChildren();
    const text = element('span', 'session-weight-note');
    if (activeSession.step === 0) {
      text.textContent = 'وزن حضور: ۱  ·  حاضر ۵ ستاره  ·  تأخیر ۳ ستاره  ·  غایب ۱ ستاره';
      root.append(text);
    } else if (activeSession.step === 1) {
      text.textContent = 'وزن تکلیف: ۲';
      root.append(text, actionButton(activeSession.skipHomework ? 'resume-homework' : 'skip-homework', activeSession.skipHomework ? 'فعال‌کردن ارزیابی تکلیف' : 'این جلسه تکلیف نداشتیم', activeSession.skipHomework ? 'btn ghost' : 'btn pink'));
    } else if (activeSession.step === 2) {
      text.textContent = 'وزن پرسش و پاسخ: ۱  ·  امتیاز خالی خنثی است';
      root.append(text);
    } else if (activeSession.step === 3) {
      text.textContent = 'وزن املا: ۲';
      root.append(text, actionButton(activeSession.skipDictation ? 'resume-dictation' : 'skip-dictation', activeSession.skipDictation ? 'فعال‌کردن ارزیابی املا' : 'این جلسه املا نداشتیم', activeSession.skipDictation ? 'btn ghost' : 'btn pink'));
    } else {
      text.textContent = 'میانگین وزنی فقط از معیارهای ارزیابی‌شده محاسبه می‌شود.';
      root.append(text);
    }
  }

  function attendanceCard(student, index) {
    const card = element('article', 'session-student-card');
    const head = element('div', 'session-student-head');
    head.append(element('span', 'session-student-index', String(index + 1)), element('strong', 'session-student-name', student.name || 'بدون نام'));
    card.appendChild(head);
    const controls = element('div', 'attendance-options');
    [['present', 'حاضر'], ['late', 'تأخیر'], ['absent', 'غایب']].forEach(([value, label]) => {
      const button = element('button', `attendance-option${student.attendanceStatus === value ? ' selected' : ''}`, label);
      button.type = 'button';
      button.dataset.attendanceStudent = String(index);
      button.dataset.attendanceStatus = value;
      button.setAttribute('aria-pressed', String(student.attendanceStatus === value));
      controls.appendChild(button);
    });
    card.append(controls, element('span', 'session-inline-note', `${statusStars[student.attendanceStatus]} از ۵ ستاره · وزن ۱`));
    return card;
  }

  function ratingCard(student, index, criterion, stars, options = {}) {
    const card = element('article', `session-student-card${student.attendanceStatus === 'absent' ? ' absent' : ''}`);
    const head = element('div', 'session-student-head');
    head.append(element('strong', 'session-student-name', student.name || 'بدون نام'));
    if (criterion === 'speaking') {
      const asked = element('button', `asked-toggle${student.speakingAsked ? ' selected' : ''}`, student.speakingAsked ? '✓ ارزیابی شد' : 'ارزیابی نشد');
      asked.type = 'button';
      asked.dataset.askedStudent = String(index);
      asked.setAttribute('aria-pressed', String(student.speakingAsked));
      head.appendChild(asked);
    }
    card.appendChild(head);

    if (student.attendanceStatus === 'absent') {
      card.appendChild(element('span', 'session-inline-note', 'غایب · در معیارهای فعالیت این جلسه خنثی است'));
      return card;
    }
    if (options.globallySkipped) {
      card.appendChild(element('span', 'session-inline-note muted', 'این بخش برای کل کلاس رد شده است'));
      return card;
    }
    if (criterion === 'speaking' && !student.speakingAsked) {
      card.appendChild(element('span', 'session-inline-note muted', 'تا زمان ارزیابی، امتیازی ثبت نمی‌شود'));
      return card;
    }

    const rating = element('div', 'session-rating');
    const starButtons = element('div', 'session-star-buttons');
    for (let value = 1; value <= 5; value += 1) {
      const button = element('button', `session-star${stars >= value ? ' earned' : ''}`, '★');
      button.type = 'button';
      button.dataset.ratingStudent = String(index);
      button.dataset.ratingCriterion = criterion;
      button.dataset.ratingStars = String(value);
      button.setAttribute('aria-label', `امتیاز ${value} از ۵`);
      button.setAttribute('aria-pressed', String(stars === value));
      starButtons.appendChild(button);
    }
    rating.append(starButtons, element('span', 'session-inline-note', stars ? `${stars} از ۵ ستاره` : 'ارزیابی نشده'));
    card.appendChild(rating);
    return card;
  }

  function renderStudents() {
    const root = list();
    const toolbarRoot = document.getElementById('trackerToolbar');
    const review = document.getElementById('trackerReview');
    if (!root) return;
    root.replaceChildren();
    if (review) { review.hidden = true; review.replaceChildren(); }
    if (toolbarRoot) toolbarRoot.hidden = false;
    const actions = document.querySelector('.session-tracker-actions');
    actions?.removeAttribute('hidden');
    const previous = actions?.querySelector('[data-tracker-action="previous"]');
    const next = actions?.querySelector('[data-tracker-action="next"]');
    if (previous) previous.disabled = activeSession.step === 0;
    if (next) next.textContent = activeSession.step === 0 ? 'اتمام حضور و غیاب و مرحله بعد' : 'اتمام و مرحله بعد';
    document.getElementById('trackerExportActions')?.setAttribute('hidden', '');
    activeSession.students.forEach((student, index) => {
      let card;
      if (activeSession.step === 0) card = attendanceCard(student, index);
      if (activeSession.step === 1) card = ratingCard(student, index, 'homework', student.homeworkStars, { globallySkipped: activeSession.skipHomework });
      if (activeSession.step === 2) card = ratingCard(student, index, 'speaking', student.speakingStars);
      if (activeSession.step === 3) card = ratingCard(student, index, 'dictation', student.dictationStars, { globallySkipped: activeSession.skipDictation });
      if (card) root.appendChild(card);
    });
  }

  function makeCriterion(stars, weight, evaluated, skipped, skipReason, extra = {}) {
    return {
      stars: evaluated ? stars : null,
      weight,
      appliedWeight: evaluated ? weight : 0,
      evaluated,
      skipped,
      ...(skipReason ? { skipReason } : {}),
      ...extra
    };
  }

  function studentResult(student) {
    const absent = student.attendanceStatus === 'absent';
    const attendance = {
      status: student.attendanceStatus,
      ...makeCriterion(statusStars[student.attendanceStatus], weights.attendance, true, false, null)
    };
    const homeworkEvaluated = !absent && !activeSession.skipHomework && validStars(student.homeworkStars) !== null;
    const homeworkReason = absent ? 'absent' : activeSession.skipHomework ? 'not-assigned' : homeworkEvaluated ? null : 'not-recorded';
    const homework = makeCriterion(student.homeworkStars, weights.homework, homeworkEvaluated, !homeworkEvaluated, homeworkReason);

    const speakingEvaluated = !absent && student.speakingAsked && validStars(student.speakingStars) !== null;
    const speakingReason = absent ? 'absent' : !student.speakingAsked ? 'not-asked' : speakingEvaluated ? null : 'not-rated';
    const speaking = makeCriterion(student.speakingStars, weights.speaking, speakingEvaluated, !speakingEvaluated, speakingReason, { asked: !absent && student.speakingAsked });

    const dictationEvaluated = !absent && !activeSession.skipDictation && validStars(student.dictationStars) !== null;
    const dictationReason = absent ? 'absent' : activeSession.skipDictation ? 'not-assigned' : dictationEvaluated ? null : 'not-recorded';
    const dictation = makeCriterion(student.dictationStars, weights.dictation, dictationEvaluated, !dictationEvaluated, dictationReason);

    const criteria = { attendance, homework, speaking, dictation };
    const weightedPoints = Object.values(criteria).reduce((sum, criterion) => sum + (criterion.stars || 0) * criterion.appliedWeight, 0);
    const appliedWeight = Object.values(criteria).reduce((sum, criterion) => sum + criterion.appliedWeight, 0);
    const averageStars = appliedWeight ? Number((weightedPoints / appliedWeight).toFixed(2)) : null;
    return {
      studentId: student.studentId,
      studentName: student.name,
      attendance,
      homework,
      speaking,
      dictation,
      total: { weightedPoints, appliedWeight, averageStars, percentage: averageStars === null ? null : Math.round(averageStars * 20) }
    };
  }

  function buildSessionRecord() {
    const results = activeSession.students.map(studentResult);
    return {
      schemaVersion: 1,
      sessionId: activeSession.sessionId,
      class: { id: activeSession.classId, name: activeSession.className },
      session: {
        number: activeSession.sessionNo,
        dateJalali: activeSession.dateJalali,
        createdAt: new Date().toISOString()
      },
      scoreScale: { min: 1, max: 5 },
      criteriaWeights: { ...weights },
      students: results
    };
  }

  function starDisplay(stars) {
    return stars ? `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}  ${stars}/۵` : '—';
  }

  function renderReview() {
    const root = document.getElementById('trackerReview');
    const studentsRoot = list();
    const toolbarRoot = document.getElementById('trackerToolbar');
    if (!root || !studentsRoot) return;
    studentsRoot.replaceChildren();
    if (toolbarRoot) toolbarRoot.hidden = true;
    const record = savedSession || buildSessionRecord();
    root.hidden = false;
    root.replaceChildren();
    const intro = element('div', 'review-intro', `جلسه ${record.session.number} · ${record.session.dateJalali} · ${record.students.length} زبان‌آموز`);
    root.appendChild(intro);
    record.students.forEach(student => {
      const card = element('article', 'review-student');
      const top = element('div', 'review-student-head');
      top.append(element('strong', '', student.studentName || 'بدون نام'), element('span', `review-score${student.attendance.status === 'absent' ? ' absent' : ''}`, student.total.averageStars === null ? '—' : `${student.total.averageStars} / ۵`));
      card.appendChild(top);
      const status = element('p', 'review-status', `${statusLabels[student.attendance.status]} · حضور ${starDisplay(student.attendance.stars)}`);
      const criteria = element('div', 'review-criteria');
      [['تکلیف', student.homework], ['پرسش', student.speaking], ['املا', student.dictation]].forEach(([label, criterion]) => {
        const item = element('div', 'review-criterion');
        item.append(element('span', '', label), element('strong', criterion.evaluated ? '' : 'neutral', criterion.evaluated ? starDisplay(criterion.stars) : '—'));
        criteria.appendChild(item);
      });
      card.append(status, criteria, element('small', 'review-weighted', `امتیاز وزنی: ${student.total.weightedPoints} ÷ ${student.total.appliedWeight} · ${student.total.percentage}%`));
      root.appendChild(card);
    });
    const saved = Boolean(savedSession);
    const actions = document.querySelector('.session-tracker-actions');
    if (actions) actions.hidden = saved;
    const previous = actions?.querySelector('[data-tracker-action="previous"]');
    if (previous) previous.disabled = false;
    const exportActions = document.getElementById('trackerExportActions');
    if (exportActions) exportActions.hidden = !saved;
    if (!saved && actions) {
      const next = actions.querySelector('[data-tracker-action="next"]');
      if (next) next.textContent = 'ثبت نهایی جلسه';
    }
  }

  function renderEmpty(classItem) {
    setText('trackerClassName', classItem?.name || 'کلاس انتخاب نشده');
    setText('trackerStepTitle', 'ثبت سریع ارزیابی جلسه');
    setText('trackerStepHint', 'برای شروع، کلاس را از صفحهٔ کلاس‌ها انتخاب کنید یا جلسهٔ ناتمام را ادامه دهید.');
    const progress = document.getElementById('trackerProgress');
    const meta = document.getElementById('trackerMeta');
    const toolbarRoot = document.getElementById('trackerToolbar');
    const review = document.getElementById('trackerReview');
    const actions = document.querySelector('.session-tracker-actions');
    const exports = document.getElementById('trackerExportActions');
    progress?.replaceChildren();
    if (meta) meta.replaceChildren();
    if (toolbarRoot) toolbarRoot.replaceChildren();
    if (review) { review.hidden = true; review.replaceChildren(); }
    list()?.replaceChildren();
    if (actions) actions.hidden = true;
    if (exports) exports.hidden = true;
    const root = list();
    if (!root) return;
    const blank = element('div', 'session-empty');
    blank.append(element('span', 'session-empty-icon', '✦'), element('strong', '', classItem?.sessionDraft ? 'یک جلسهٔ ناتمام دارید' : 'آمادهٔ ثبت جلسه هستید'), element('p', '', classItem?.sessionDraft ? 'برای ادامه از همان مرحله‌ای که ذخیره کرده‌اید شروع کنید.' : 'ثبت حضور و ارزیابی روزانهٔ کلاس را در پنج مرحله انجام دهید.'));
    blank.appendChild(actionButton('start', classItem?.sessionDraft ? 'ادامهٔ جلسه' : 'شروع جلسه', 'btn primary'));
    root.appendChild(blank);
  }

  function renderSavedSession() {
    setText('trackerClassName', savedSession.class?.name || 'کلاس');
    setText('trackerStepTitle', 'جلسهٔ ثبت‌شده');
    setText('trackerStepHint', 'خروجی جلسهٔ اخیر آمادهٔ دریافت است.');
    const progress = document.getElementById('trackerProgress');
    if (progress) {
      progress.replaceChildren();
      steps.forEach((step, index) => {
        const item = element('div', 'session-progress-step complete');
        item.append(element('span', 'session-progress-number', String(index + 1)), element('span', 'session-progress-label', step.title));
        progress.appendChild(item);
      });
    }
    const meta = document.getElementById('trackerMeta');
    if (meta) {
      meta.replaceChildren();
      meta.append(element('span', '', `جلسه ${savedSession.session.number}`), element('span', '', savedSession.session.dateJalali));
    }
    const toolbarRoot = document.getElementById('trackerToolbar');
    if (toolbarRoot) {
      toolbarRoot.hidden = true;
      toolbarRoot.replaceChildren();
    }
    renderReview();
  }

  function render() {
    const classItem = selectedClass();
    if (!page() || !page().classList.contains('active')) return;
    if (activeSession && classItem && String(activeSession.classId) !== String(classItem.id)) {
      activeSession = null;
      savedSession = null;
    }
    if (savedSession && classItem && String(savedSession.class?.id) !== String(classItem.id)) savedSession = null;
    if (!activeSession && classItem?.sessionDraft && !savedSession) activeSession = normalizeDraft(classItem.sessionDraft, classItem);
    if (!activeSession && !savedSession && classItem?.evaluationSessions?.length) savedSession = classItem.evaluationSessions[classItem.evaluationSessions.length - 1];
    if (!activeSession) return savedSession ? renderSavedSession() : renderEmpty(classItem);

    const current = currentStep();
    setText('trackerClassName', activeSession.className);
    setText('trackerStepTitle', current.title);
    setText('trackerStepHint', current.hint);
    renderProgress();
    const meta = document.getElementById('trackerMeta');
    if (meta) {
      meta.replaceChildren();
      meta.append(element('span', '', `جلسه ${activeSession.sessionNo}`), element('span', '', activeSession.dateJalali));
    }
    toolbar();
    if (activeSession.step === 4) renderReview();
    else renderStudents();
  }

  function nextStep() {
    if (!activeSession) return;
    if (activeSession.step < 4) {
      activeSession.step += 1;
      persistDraft();
      render();
      page()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    saveSession();
  }

  function previousStep() {
    if (!activeSession || activeSession.step <= 0) return;
    activeSession.step -= 1;
    savedSession = null;
    persistDraft();
    render();
  }

  function saveSession() {
    if (!activeSession) return;
    const classItem = global.AppStore.state?.classes?.find(item => String(item.id) === String(activeSession.classId));
    if (!classItem) return global.toast?.('کلاس جلسه پیدا نشد؛ ثبت انجام نشد.');
    if (classItem.evaluationSessions?.some(session => session.sessionId === activeSession.sessionId)) {
      savedSession = classItem.evaluationSessions.find(session => session.sessionId === activeSession.sessionId);
      return render();
    }
    const record = buildSessionRecord();
    classItem.evaluationSessions ||= [];
    classItem.evaluationSessions.push(record);
    classItem.sessionDraft = null;
    if (!global.AppStore.save()) {
      classItem.evaluationSessions.pop();
      classItem.sessionDraft = activeSession;
      return global.toast?.('ذخیره‌سازی انجام نشد؛ فضای ذخیره‌سازی مرورگر را بررسی کنید.');
    }
    savedSession = record;
    global.toast?.('ارزیابی جلسه ذخیره شد.');
    render();
  }

  function exportJson() {
    if (!savedSession) return global.toast?.('ابتدا جلسه را ثبت نهایی کنید.');
    const blob = new Blob([JSON.stringify(savedSession, null, 2)], { type: 'application/json;charset=utf-8' });
    download(blob, `${filePart(savedSession.class.name)}-session-${filePart(savedSession.session.number)}.json`);
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function filePart(value) {
    return String(value || 'session').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').slice(0, 70) || 'session';
  }

  function makeCard(student) {
    const card = element('article', 'session-share-card');
    const brand = element('div', 'share-brand');
    brand.append(element('span', 'share-brand-mark', 'د'), element('div', '', ''));
    brand.lastChild.append(element('strong', '', 'آموزشگاه زبان دماوند'), element('small', '', 'گزارش ارزیابی جلسه'));
    card.appendChild(brand);
    card.append(element('div', 'share-divider'), element('span', 'share-kicker', 'گزارش عملکرد زبان‌آموز'));
    card.append(element('h2', 'share-student-name', student.studentName || 'بدون نام'));
    const meta = element('div', 'share-meta');
    meta.append(element('span', '', `کلاس ${savedSession.class.name}`), element('span', '', `جلسه ${savedSession.session.number}`), element('span', '', savedSession.session.dateJalali));
    card.appendChild(meta);
    const criteria = element('div', 'share-criteria');
    [['حضور و غیاب', student.attendance], ['تکلیف', student.homework], ['پرسش و پاسخ', student.speaking], ['املا و آزمون', student.dictation]].forEach(([label, criterion]) => {
      const row = element('div', 'share-criterion');
      row.append(element('span', 'share-criterion-name', label), element('span', criterion.evaluated ? 'share-criterion-stars' : 'share-criterion-stars skipped', criterion.evaluated ? starDisplay(criterion.stars) : '—'));
      criteria.appendChild(row);
    });
    card.appendChild(criteria);
    const score = element('div', 'share-overall');
    score.append(element('small', '', 'میانگین وزنی این جلسه'), element('strong', '', `${student.total.averageStars ?? '—'} / ۵`), element('span', '', `${student.total.percentage ?? 0}%`));
    card.appendChild(score);
    card.append(element('p', 'share-footnote', 'امتیازهای خالی و بخش‌های ردشده در میانگین محاسبه نشده‌اند.'));
    return card;
  }

  async function exportCardsZip() {
    if (!savedSession) return global.toast?.('ابتدا جلسه را ثبت نهایی کنید.');
    if (typeof global.html2canvas !== 'function') return global.toast?.('ابزار ساخت تصویر در دسترس نیست.');
    const students = savedSession.students.filter(student => student.attendance.status !== 'absent');
    if (!students.length) return global.toast?.('برای این جلسه زبان‌آموز حاضر یا با تأخیر ثبت نشده است.');
    const stage = document.getElementById('sessionCardStage');
    if (!stage) return global.toast?.('محل ساخت کارت‌ها پیدا نشد.');
    const files = [];
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      for (let index = 0; index < students.length; index += 1) {
        const student = students[index];
        global.toast?.(`در حال ساخت کارت ${index + 1} از ${students.length}…`);
        stage.replaceChildren();
        const card = makeCard(student);
        stage.appendChild(card);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = await global.html2canvas(card, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!png) throw new Error('PNG generation failed');
        files.push({ name: `${String(index + 1).padStart(2, '0')}-${filePart(student.studentName)}.png`, data: new Uint8Array(await png.arrayBuffer()) });
      }
      const zip = buildZip(files);
      download(zip, `${filePart(savedSession.class.name)}-session-${filePart(savedSession.session.number)}-cards.zip`);
      global.toast?.(`${files.length} کارت PNG در فایل ZIP آماده شد.`);
    } catch (error) {
      console.error('Session card export failed', error);
      global.toast?.('ساخت کارت‌ها کامل نشد؛ دوباره تلاش کنید.');
    } finally {
      stage.replaceChildren();
    }
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipHeader(size, filenameLength, crc, time, date, offset = 0, central = false) {
    const header = new Uint8Array((central ? 46 : 30) + filenameLength);
    const view = new DataView(header.buffer);
    if (central) {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0x0800, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, time, true);
      view.setUint16(14, date, true);
      view.setUint32(16, crc, true);
      view.setUint32(20, size, true);
      view.setUint32(24, size, true);
      view.setUint16(28, filenameLength, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, offset, true);
    } else {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, time, true);
      view.setUint16(12, date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, size, true);
      view.setUint32(22, size, true);
      view.setUint16(26, filenameLength, true);
      view.setUint16(28, 0, true);
    }
    return header;
  }

  function buildZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    let offset = 0;
    files.forEach(file => {
      const name = encoder.encode(file.name);
      const crc = crc32(file.data);
      const local = zipHeader(file.data.length, name.length, crc, dosTime, dosDate);
      local.set(name, 30);
      localParts.push(local, file.data);
      const central = zipHeader(file.data.length, name.length, crc, dosTime, dosDate, offset, true);
      central.set(name, 46);
      centralParts.push(central);
      offset += local.length + file.data.length;
    });
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);
    return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
  }

  function handleAction(action) {
    if (action === 'start') return startSession();
    if (action === 'back-to-classes') return global.showPage?.('page-classes');
    if (action === 'previous') return previousStep();
    if (action === 'next') return nextStep();
    if (action === 'skip-homework') { activeSession.skipHomework = true; activeSession.step = 2; persistDraft(); return render(); }
    if (action === 'resume-homework') { activeSession.skipHomework = false; persistDraft(); return render(); }
    if (action === 'skip-dictation') { activeSession.skipDictation = true; activeSession.step = 4; persistDraft(); return render(); }
    if (action === 'resume-dictation') { activeSession.skipDictation = false; persistDraft(); return render(); }
    if (action === 'export-json') return exportJson();
    if (action === 'export-cards') return exportCardsZip();
    if (action === 'new-session') { activeSession = null; savedSession = null; return startSession(); }
  }

  function initialize() {
    if (page()?.dataset.bound === 'true') return;
    const root = page();
    if (!root) return;
    root.dataset.bound = 'true';
    document.getElementById('startSessionTracker')?.addEventListener('click', startSession);
    root.addEventListener('click', event => {
      const action = event.target.closest('[data-tracker-action]');
      if (action) return handleAction(action.dataset.trackerAction);

      const attendanceButton = event.target.closest('[data-attendance-student]');
      if (attendanceButton && activeSession) {
        activeSession.students[Number(attendanceButton.dataset.attendanceStudent)].attendanceStatus = attendanceButton.dataset.attendanceStatus;
        persistDraft();
        return render();
      }

      const ratingButton = event.target.closest('[data-rating-student]');
      if (ratingButton && activeSession) {
        const student = activeSession.students[Number(ratingButton.dataset.ratingStudent)];
        const stars = Number(ratingButton.dataset.ratingStars);
        const criterion = ratingButton.dataset.ratingCriterion;
        const key = criterion === 'homework' ? 'homeworkStars' : criterion === 'speaking' ? 'speakingStars' : 'dictationStars';
        student[key] = student[key] === stars ? null : stars;
        if (criterion === 'speaking' && student[key] !== null) student.speakingAsked = true;
        persistDraft();
        return render();
      }

      const askedButton = event.target.closest('[data-asked-student]');
      if (askedButton && activeSession) {
        const student = activeSession.students[Number(askedButton.dataset.askedStudent)];
        student.speakingAsked = !student.speakingAsked;
        if (!student.speakingAsked) student.speakingStars = null;
        persistDraft();
        return render();
      }
    });
    render();
  }

  global.initializeSessionTracker = initialize;
  global.renderSessionTracker = render;
})(window);
