// ========================================================
/* #region  ط¨ط®ط´ ط¨ط§ط² ظˆ ط¨ط³طھظ‡ ع©ط±ط¯ظ† ظ…ظ†ظˆغŒ ع©ظ†ط§ط±غŒ */

const menuBtn = $('menuBtn');
const drawer = $('menuDrawer');


function closeMenu() {
  drawer?.classList.remove('open');
  syncOverlay();
}


menuBtn.addEventListener('click', () => {
  drawer.classList.toggle('open');
  syncOverlay()
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', event => {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', event => {
  const touch = event.changedTouches[0];
  if (!touch) return;
  const deltaX = touchStartX - touch.clientX;
  const deltaY = Math.abs(touchStartY - touch.clientY);
  if (touchStartX > window.innerWidth * 0.65 && deltaX > 55 && deltaY < 80) {
    drawer?.classList.add('open');
    syncOverlay();
  }
}, { passive: true });


/* #endregion */
// ========================================================


