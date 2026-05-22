let toastTimer;

export function showToast(msg, type = '') {
  const toast = document.getElementById('toast');

  toast.textContent = msg;
  toast.className = `toast${type ? ' ' + type : ''} show`;

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}