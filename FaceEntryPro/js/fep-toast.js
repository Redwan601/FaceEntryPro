/* Small reusable toast used to surface cross-page scanner activity
   (new attendance on the faculty dashboard, security alerts on admin
   pages) without needing a real push/websocket layer. */
function fepShowToast(title, subtitle, tone){
  const colors = {
    success: { bg: 'rgba(47,213,196,0.15)', fg: 'var(--scan)', icon: '<path d="M20 6L9 17l-5-5"/>' },
    danger:  { bg: 'rgba(255,92,92,0.15)',  fg: 'var(--red)',  icon: '<path d="M12 9v4m0 4h.01M10.3 3.9L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' }
  };
  const c = colors[tone] || colors.success;
  const toast = document.createElement('div');
  toast.className = 'fep-toast';
  toast.innerHTML = `
    <div class="icon" style="background:${c.bg};color:${c.fg};"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${c.icon}</svg></div>
    <div><div class="t">${title}</div><div class="s">${subtitle}</div></div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 6000);
}
