// Theme sync for iframe demos (default, dark, midnight, corporate, warm)
const normalizeTheme = (value) => {
  if (!value || value === 'light') return 'default';
  return value;
};

const applyTheme = (value) => {
  const theme = normalizeTheme(value);
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'theme') {
    applyTheme(e.data.theme);
  }
});
