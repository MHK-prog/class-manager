// ========================================================
/* #region  ط¨ط®ط´ ط¨ط§ط² ظˆ ط¨ط³طھظ‡ ع©ط±ط¯ظ† ظ…ظ†ظˆغŒ ع©ظ†ط§ط±غŒ */

const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('menuDrawer');


function closeMenu() {
  drawer?.classList.remove('open');
  syncOverlay();
}


menuBtn.addEventListener('click', () => {
  drawer.classList.toggle('open');
  syncOverlay()
});


/* #endregion */
// ========================================================


