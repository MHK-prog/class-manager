function submitAddClass() {
  const input = document.getElementById('modalClassNameInput');
  const name = input?.value.trim();

  if (!name) return toast('نام کلاس را وارد کنید.');

  AppStore.addClass(name);
  render();
  refreshDependents();
  closeModal('addClassModal');
  toast('کلاس اضافه شد.');
}

function openAddClassModal() {
  document.getElementById('addClassModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'addClassModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <header><h2>اضافه کردن کلاس جدید</h2></header>
    <input type="text" id="modalClassNameInput" placeholder="نام کلاس...">
    <div class="row">
      <button type="button" class="btn ghost" id="cancelAddClass">انصراف</button>
      <button type="button" class="btn primary" id="submitAddClass">ثبت کلاس</button>
    </div>
  `;
  document.body.appendChild(modal);

  // لیسنرهای دکمه‌ها و کیبورد
  document.getElementById('cancelAddClass').addEventListener('click', () => closeModal('addClassModal'));
  document.getElementById('submitAddClass').addEventListener('click', submitAddClass);
  
  const inputEl = document.getElementById('modalClassNameInput');
  inputEl.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitAddClass();
    if (event.key === 'Escape') closeModal('addClassModal');
  });

  openModal('addClassModal');
  setTimeout(() => inputEl?.focus(), 50);
}
