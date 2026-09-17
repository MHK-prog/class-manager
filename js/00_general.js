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
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
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

document.addEventListener('DOMContentLoaded', () => {
  $('toastX')?.addEventListener('click', () => { $('toast').style.display = 'none'; });
});
