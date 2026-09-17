// ========================================================
// ماژول مودال تغییر نام کلاس

(function createRenameClassModalModule(global) {
  function submit() {
    const input = $('renameClassNameInput');
    const name = input?.value.trim() || '';
    if (!name) return toast('نام جدید را وارد کنید.');
    global.ClassesModule.rename(name);
  }

  function open() {
    const classItem = AppStore.getSelectedClass();
    if (!classItem) return toast('ابتدا یک کلاس را انتخاب کنید.');

    $('renameClassModal')?.remove();
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

    const input = $('renameClassNameInput');
    input.value = classItem.name || '';
    $('cancelRenameClass').addEventListener('click', () => closeModal('renameClassModal'));
    $('submitRenameClass').addEventListener('click', submit);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') submit();
      if (event.key === 'Escape') closeModal('renameClassModal');
    });

    openModal('renameClassModal');
    setTimeout(() => { input.focus(); input.select(); }, 50);
  }

  global.ClassRenameModal = Object.freeze({ open, submit });
  global.openRenameClassModal = open;
  global.submitRenameClass = submit;
})(window);
