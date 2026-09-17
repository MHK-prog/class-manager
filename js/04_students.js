// ========================================================
// #region [بلوک ۲: مدیریت زبان‌آموزان]
function renderStudentsManage() {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;

  const list = $('studentsManageList');
  const countEl = $('studentsCount');
  const emptyEl = $('studentsEmpty');
  const students = cls.students || [];

  if (countEl) countEl.textContent = students.length + ' نفر';
  if (emptyEl) emptyEl.style.display = students.length ? 'none' : 'block';
  if (!list) return;

  list.innerHTML = '';
  students.forEach((st, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:8px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0;';

    const num = document.createElement('span');
    num.style.cssText = 'color:var(--muted); font-size:12px; font-weight:bold; width:24px; text-align:center;';
    num.textContent = `#${idx + 1}`;

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = st.fullName || '';
    inp.style.cssText = 'flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:500; font-size:14px;';
    inp.oninput = (e) => {
      st.fullName = e.target.value;
      AppStore.save();
    };

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn pink';
    delBtn.style.cssText = 'padding:6px 12px; min-height:34px; font-size:12px;';
    delBtn.textContent = 'حذف';
    delBtn.onclick = () => {
      if (!confirm('آیا از حذف این زبان‌آموز مطمئن هستید؟')) return;
      cls.students = cls.students.filter(s => s.id !== st.id);
      AppStore.save();
      renderStudentsManage();
      toast('زبان‌آموز حذف شد.');
    };

    row.appendChild(num);
    row.appendChild(inp);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}

function addStudent() {
  const cls = AppStore.getSelectedClass();
  if (!cls) return;
  const input = $('newStudentName');
  const name = (input?.value || '').trim();
  if (!name) return toast('لطفاً نام زبان‌آموز را وارد کنید.');

  cls.students.push(AppStore.createStudent(name));
  if (input) input.value = '';
  AppStore.save();
  renderStudentsManage();
  toast('زبان‌آموز اضافه شد.');
}

$('btnAddStudent')?.addEventListener('click', addStudent);
$('newStudentName')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addStudent(); });
// #endregion
// ========================================================

