// Theme sync for iframe demos
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'theme') {
    if (e.data.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
});
