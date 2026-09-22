function submitRenameClass() {
  const input = document.getElementById('renameClassNameInput');
  const name = input?.value.trim();

  if (!name) return toast('نام جدید را وارد کنید.');

  ClassesModule.rename(name);
}

function openRenameClassModal() {
  const classItem = AppStore.getSelectedClass();
  if (!classItem) return toast('ابتدا یک کلاس را انتخاب کنید.');

  document.getElementById('renameClassModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'renameClassModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <header><h2>تغییر نام کلاس</h2></header>
    <input type="text" id="renameClassNameInput" placeholder="نام جدید کلاس...">
    <div class="row">
      <button type="button" class="btn ghost" id="cancelRenameClass">انصراف</button>
      <button type="button" class="btn primary" id="submitRenameClass">ثبت تغییر</button>
    </div>
  `;
  document.body.appendChild(modal);

  const input = document.getElementById('renameClassNameInput');
  input.value = classItem.name || '';

  // رویداد دکمه‌ها
  document.getElementById('cancelRenameClass').addEventListener('click', () => closeModal('renameClassModal'));
  document.getElementById('submitRenameClass').addEventListener('click', submitRenameClass);

  // رویدادهای کیبورد (Enter و Esc)
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitRenameClass();
    if (event.key === 'Escape') closeModal('renameClassModal');
  });

  openModal('renameClassModal');
  setTimeout(() => {
    input.focus();
    input.select();
  }, 50);
}
