import { Playground } from './shared/playground.js';

const THEME_OPTIONS = ['default', 'dark', 'midnight', 'corporate', 'warm'];

const normalizeTheme = (value) => {
  if (!value || value === 'light') return 'default';
  return THEME_OPTIONS.includes(value) ? value : 'default';
};

/** @type {{ id: string, title: string, schema?: string, staticPage?: string }[]} */
const DEMOS = [
  { id: 'button', title: 'Button' },
  { id: 'input', title: 'Input' },
  { id: 'select', title: 'Select' },
  { id: 'textarea', title: 'Textarea' },
  { id: 'checkbox', title: 'Checkbox' },
  { id: 'radio', title: 'Radio' },
  { id: 'toggle', title: 'Toggle' },
  { id: 'badge', title: 'Badge' },
  { id: 'progress', title: 'Progress' },
  { id: 'slider', title: 'Slider' },
  { id: 'card', title: 'Card' },
  { id: 'file-upload', title: 'File upload' },
  { id: 'tooltip', title: 'Tooltip' },
  { id: 'autocomplete', title: 'Autocomplete' },
  { id: 'datepicker', title: 'Datepicker' },
  { id: 'tabs', title: 'Tabs' },
  { id: 'alert', title: 'Alert' },
  { id: 'spinner', title: 'Spinner' },
  { id: 'avatar', title: 'Avatar' },
  { id: 'tag', title: 'Tag' },
  { id: 'breadcrumb', title: 'Breadcrumb' },
  { id: 'pagination', title: 'Pagination' },
  { id: 'table', title: 'Table' },
  { id: 'steps', title: 'Steps' },
  { id: 'modal', title: 'Modal' },
  { id: 'dropdown', title: 'Dropdown' },
  { id: 'chip', title: 'Chip' },
  { id: 'divider', title: 'Divider' },
  { id: 'empty-state', title: 'Empty state' },
  { id: 'banner', title: 'Banner', staticPage: 'banner.html' },
  { id: 'callout', title: 'Callout', staticPage: 'callout.html' },
  { id: 'skeleton', title: 'Skeleton' },
  { id: 'stat-card', title: 'Stat card' },
  { id: 'section-header', title: 'Section header' },
  { id: 'feed', title: 'Feed', staticPage: 'feed.html' },
  { id: 'rating', title: 'Rating' },
  { id: 'search', title: 'Search' },
  { id: 'status', title: 'Status' },
  { id: 'notification', title: 'Notification' },
  { id: 'sidebar', title: 'Sidebar' },
  { id: 'navbar', title: 'Navbar' },
  { id: 'typography', title: 'Typography', staticPage: 'typography.html' },
  { id: 'accordion', title: 'Accordion' },
  { id: 'kbd', title: 'Kbd' },
  { id: 'timeline', title: 'Timeline' },
  { id: 'pricing-card', title: 'Pricing card' },
  { id: 'feature-item', title: 'Feature item' },
  { id: 'chat', title: 'Chat' },
  { id: 'toggle-item', title: 'Form row', staticPage: 'toggle-item.html' },
  { id: 'color-swatch', title: 'Color swatch' },
  { id: 'logo-cloud', title: 'Logo cloud' },
  { id: 'chart-legend', title: 'Chart legend' },
  { id: 'footer', title: 'Footer' },
  { id: 'icons', title: 'Icons', staticPage: 'icons.html' },
].map((d) => {
  if (d.staticPage) {
    return {
      ...d,
      pageHref: new URL(d.staticPage, import.meta.url).href,
    };
  }
  return {
    ...d,
    schemaHref: new URL(`./schemas/${d.id}.js`, import.meta.url).href,
  };
});

let activePlayground = null;

function setShellTheme(value) {
  const theme = normalizeTheme(value);
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  const sel = document.getElementById('theme-select');
  if (sel) sel.value = theme;
  localStorage.setItem('theme', theme);
  activePlayground?.setTheme(theme);
}

function renderNav(activeId) {
  const list = document.getElementById('showcase-nav');
  if (!list) return;

  list.replaceChildren(
    ...DEMOS.map((demo) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'showcase-app__nav-item' + (demo.id === activeId ? ' showcase-app__nav-item--active' : '');
      btn.textContent = demo.title;
      btn.addEventListener('click', () => {
        window.location.hash = demo.id;
      });
      li.appendChild(btn);
      return li;
    })
  );
}

function mountStatic(demo) {
  activePlayground = null;
  const stage = document.getElementById('showcase-stage');
  if (!stage) return;

  const open = demo.pageHref;
  stage.innerHTML = `
    <div class="showcase-app__panel">
      <h2 class="showcase-app__demo-title">${demo.title}</h2>
      <div class="showcase-app__fallback">
        <p>Это демо — длинная статическая страница без интерактивной схемы. Откройте в отдельной вкладке.</p>
        <a class="ui-button ui-button--primary" href="${open}" target="_blank" rel="noopener noreferrer">Открыть ${demo.title}</a>
      </div>
    </div>
  `;
}

function mountPlayground(demo) {
  const stage = document.getElementById('showcase-stage');
  if (!stage) return;

  activePlayground = null;
  stage.innerHTML = `
    <div class="showcase-app__panel">
      <h2 class="showcase-app__demo-title">${demo.title}</h2>
      <main class="ui-playground" data-component="${demo.id}"></main>
    </div>
  `;
  const host = stage.querySelector('.ui-playground');
  activePlayground = new Playground(host, demo.schemaHref, { hideThemeControls: true });

  const saved = normalizeTheme(localStorage.getItem('theme'));
  host.addEventListener(
    'playground-ready',
    () => {
      activePlayground?.setTheme(saved);
    },
    { once: true }
  );
}

function routeFromHash() {
  const raw = (window.location.hash || '').replace(/^#/, '');
  const id = raw.split('/').filter(Boolean)[0] || DEMOS[0].id;
  const demo = DEMOS.find((d) => d.id === id) || DEMOS[0];
  if (demo.id !== id) {
    window.location.hash = demo.id;
    return;
  }
  renderNav(demo.id);
  if (demo.staticPage) {
    mountStatic(demo);
  } else {
    mountPlayground(demo);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme-select');
  setShellTheme(normalizeTheme(localStorage.getItem('theme')));

  themeSelect?.addEventListener('change', (e) => {
    setShellTheme(e.target.value);
  });

  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();
});
