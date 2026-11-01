// ========================================================
// ابزارهای عمومی رابط کاربری

const $ = (id) => document.getElementById(id);

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return '';

  const digits = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '٫': '.', '،': '.', ',': '.'
  };

  return String(value).replace(/[۰-۹٠-٩٫،,]/g, char => digits[char] || char).trim();
}

function jalaliToday() {
  try {
    const raw = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    // حذف کاراکترهای مخفی یونیکد جهت متن و تبدیل به عدد انگلیسی
    return normalizeNumber(raw.replace(/[\u200e\u200f\u202a-\u202e]/g, ''));
  } catch (error) {
    return '';
  }
}


function toast(message) {
  const box = $('toast');
  const messageElement = $('toastMsg');
  if (!box || !messageElement) return alert(message);

  messageElement.textContent = message;
  box.style.display = 'flex';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { box.style.display = 'none'; }, 3000);
}

function enableEnterAsTab(scopeId) {
  const root = $(scopeId);
  if (!root || root.dataset.enterAsTabBound) return;
  root.dataset.enterAsTabBound = 'true';
  root.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    const target = event.target;
    if (!target.matches('input, select, textarea')) return;
    const fields = [...root.querySelectorAll('input, select, textarea, button')]
      .filter(field => !field.disabled && field.type !== 'hidden' && field.offsetParent !== null);
    const index = fields.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    fields[(index + 1) % fields.length]?.focus();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $('toastX')?.addEventListener('click', () => { $('toast').style.display = 'none'; });
});
