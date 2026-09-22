function openDeleteClassModal() {
  const currentState = AppStore.state || AppStore.load();
  
  // شرط: اگر کلاسی نیست یا کلاً ۱ کلاس داریم، اجازه حذف نده
  if (!currentState || currentState.classes.length <= 1) {
    return toast('حداقل یک کلاس باید باقی بماند.');
  }

  // اگر از قبل مودالی توی DOM هست پاکش کن
  document.getElementById('deleteClassModal')?.remove();

  // ساخت عناصر مودال
  const modal = document.createElement('div');
  modal.id = 'deleteClassModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <header><h2>حذف کلاس</h2></header>
    <p style="margin: 12px 0;">آیا از حذف این کلاس مطمئن هستید؟ این عملیات قابل بازگشت نیست.</p>
    <div class="row">
      <button type="button" class="btn ghost" id="cancelDeleteClass">انصراف</button>
      <button type="button" class="btn danger" id="submitDeleteClass">بله، حذف شود</button>
    </div>
  `;
  document.body.appendChild(modal);

  // رویداد انصراف
  document.getElementById('cancelDeleteClass').addEventListener('click', () => {
    closeModal('deleteClassModal');
  });

  // رویداد تایید حذف
  document.getElementById('submitDeleteClass').addEventListener('click', () => {
    if (!AppStore.deleteSelectedClass()) {
      closeModal('deleteClassModal');
      return toast('حداقل یک کلاس باید باقی بماند.');
    }
    render();
    refreshDependents();
    closeModal('deleteClassModal');
    toast('کلاس حذف شد.');
  });

  // باز کردن مودال
  openModal('deleteClassModal');
}
