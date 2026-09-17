// ========================================================
// ماژول مودال ساخت کلاس

(function createClassModalModule(global) {
  function submit() {
    const input = $('modalClassNameInput');
    const name = input?.value.trim() || '';
    if (!name) return toast('نام کلاس را وارد کنید.');
    global.ClassesModule.create(name);
  }

  function open() {
    $('addClassModal')?.remove();

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

    $('cancelAddClass').addEventListener('click', () => closeModal('addClassModal'));
    $('submitAddClass').addEventListener('click', submit);
    $('modalClassNameInput').addEventListener('keydown', event => {
      if (event.key === 'Enter') submit();
      if (event.key === 'Escape') closeModal('addClassModal');
    });

    openModal('addClassModal');
    setTimeout(() => $('modalClassNameInput')?.focus(), 50);
  }

  global.ClassCreateModal = Object.freeze({ open, submit });
  global.showAddClassModal = open;
  global.openAddClassModal = open;
  global.submitNewClass = submit;
})(window);
