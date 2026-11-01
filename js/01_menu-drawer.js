// ========================================================
/* #region  ط¨ط®ط´ ط¨ط§ط² ظˆ ط¨ط³طھظ‡ ع©ط±ط¯ظ† ظ…ظ†ظˆغŒ ع©ظ†ط§ط±غŒ */

const menuBtn = $('menuBtn');
const drawer = $('menuDrawer');
const overlay = $('modalOverlay');
const EDGE_GESTURE_WIDTH = 32;
const DRAG_START_DISTANCE = 7;

let drawerGesture = null;
let suppressedDragClick = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDrawerOffset(width) {
  const drawerLeft = drawer.getBoundingClientRect().left;
  return clamp(drawerLeft - (window.innerWidth - width), 0, width);
}

function setMenuOpen(isOpen) {
  if (!drawer) return;
  drawer.classList.remove('dragging');
  drawer.classList.toggle('open', isOpen);
  drawer.style.removeProperty('transform');
  if (overlay) {
    overlay.classList.remove('dragging');
    overlay.style.opacity = '';
  }
  menuBtn?.setAttribute('aria-expanded', String(isOpen));
  syncOverlay();
}

function closeMenu() {
  setMenuOpen(false);
}

menuBtn?.setAttribute('aria-controls', 'menuDrawer');
menuBtn?.setAttribute('aria-expanded', String(drawer?.classList.contains('open') || false));
menuBtn?.addEventListener('click', () => {
  setMenuOpen(!drawer?.classList.contains('open'));
});

document.addEventListener('pointerdown', event => {
  if (!drawer || drawerGesture || event.isPrimary === false || event.pointerType === 'mouse') return;

  const width = drawer.getBoundingClientRect().width;
  if (!width) return;

  const offset = getDrawerOffset(width);
  const isOpen = drawer.classList.contains('open') || offset < width - 1;
  const target = event.target;
  const startsOnDrawer = target instanceof Element && drawer.contains(target);
  const startsOnOverlay = target === overlay;
  let mode;

  if (isOpen) {
    if (!startsOnDrawer && !startsOnOverlay) return;
    mode = 'close';
  } else {
    if (document.querySelector('.modal.active')) return;
    if (event.clientX < window.innerWidth - EDGE_GESTURE_WIDTH) return;
    mode = 'open';
  }

  drawerGesture = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startOffset: offset,
    lastOffset: offset,
    width,
    mode,
    origin: target,
    dragging: false
  };

  try {
    target?.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture is optional; document-level listeners still track the gesture.
  }
}, { passive: true });

document.addEventListener('pointermove', event => {
  const gesture = drawerGesture;
  if (!gesture || gesture.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - gesture.startX;
  const deltaY = event.clientY - gesture.startY;

  if (!gesture.dragging) {
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DRAG_START_DISTANCE) return;
    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      drawerGesture = null;
      return;
    }

    const movingInDrawerDirection = gesture.mode === 'open' ? deltaX < 0 : deltaX > 0;
    if (!movingInDrawerDirection) {
      drawerGesture = null;
      return;
    }

    gesture.dragging = true;
    drawer.classList.add('open', 'dragging');
    overlay?.classList.add('dragging');
    syncOverlay();
  }

  if (event.cancelable) event.preventDefault();
  gesture.lastOffset = clamp(gesture.startOffset + deltaX, 0, gesture.width);
  drawer.style.transform = `translate3d(${gesture.lastOffset}px, 0, 0)`;
  if (overlay) overlay.style.opacity = String(1 - gesture.lastOffset / gesture.width);
}, { passive: false });

function finishDrawerGesture(event) {
  const gesture = drawerGesture;
  if (!gesture || (event && gesture.pointerId !== event.pointerId)) return;
  drawerGesture = null;
  if (!gesture.dragging) return;

  if (event?.type === 'pointerup') {
    gesture.lastOffset = clamp(gesture.startOffset + event.clientX - gesture.startX, 0, gesture.width);
  }
  const shouldOpen = gesture.lastOffset < gesture.width / 2;
  drawer.classList.remove('dragging');
  drawer.classList.toggle('open', shouldOpen);
  drawer.style.removeProperty('transform');
  if (overlay) {
    overlay.classList.remove('dragging');
    overlay.style.opacity = '';
  }
  menuBtn?.setAttribute('aria-expanded', String(shouldOpen));
  suppressedDragClick = { origin: gesture.origin, until: Date.now() + 500 };
  syncOverlay();
}

document.addEventListener('pointerup', finishDrawerGesture, { passive: true });
document.addEventListener('pointercancel', finishDrawerGesture, { passive: true });

document.addEventListener('click', event => {
  if (!suppressedDragClick) return;
  if (Date.now() > suppressedDragClick.until) {
    suppressedDragClick = null;
    return;
  }

  const origin = suppressedDragClick.origin;
  const target = event.target;
  const sameGestureTarget = target === origin
    || (origin instanceof Element && origin.contains(target))
    || (target instanceof Element && target !== document.body && target !== document.documentElement && target.contains(origin));
  if (!sameGestureTarget) return;

  suppressedDragClick = null;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);


/* #endregion */
// ========================================================


