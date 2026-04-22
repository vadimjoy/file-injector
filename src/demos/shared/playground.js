/* ==========================================================================
   AI CSS Kit — Playground Runtime
   Phase 4.3: Schema-driven interactive component demos
   Vanilla JS + ES Modules, no build step required
   ========================================================================== */

const html = (strings, ...values) => strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');

class Playground {
  /**
   * @param {HTMLElement} host
   * @param {string} schemaUrl
   * @param {{ hideThemeControls?: boolean }} [options] — в каталоге (`showcase-app`) тема задаётся снаружи; дублирующий ряд Theme в playground скрывают.
   */
  constructor(host, schemaUrl, options = {}) {
    this.host = host;
    this.options = { hideThemeControls: false, ...options };
    this.schema = null;
    this.state = {};
    this.originalTokens = {};
    this.changedTokens = new Set();
    this.previewInner = null;
    this.codeBody = null;
    this.tokensBody = null;
    /** Состояние глобальной панели (синхрон с чипами и с preview-inner). */
    this._global = { theme: 'default', viewport: 'desktop', rtl: false };
    if (this.options.hideThemeControls && typeof document !== 'undefined') {
      const shell = document.documentElement.getAttribute('data-theme');
      this._global.theme = shell && shell !== 'light' ? shell : 'default';
    }

    this.loadSchema(schemaUrl);
  }

  async loadSchema(url) {
    let resolved = url;
    if (typeof document !== 'undefined' && document.baseURI) {
      try {
        resolved = new URL(url, document.baseURI).href;
      } catch {
        resolved = url;
      }
    }
    try {
      const module = await import(/* @vite-ignore */ resolved);
      this.schema = module.default || module;
      this.init();
    } catch (err) {
      console.error('Failed to load schema:', resolved, err);
      this.host.innerHTML = `<div class="ui-alert ui-alert--error">Failed to load schema: ${url}<br><small>Resolved: ${resolved}</small></div>`;
    }
  }

  init() {
    if (!this.schema) return;

    this.renderShell();
    this.initState();
    this.renderControls();
    this.bindGlobalControls();
    this.updatePreview();
    this.updateCode();
    this.collectOriginalTokens();
    this.updateTokens();
    this.host.dispatchEvent(new Event('playground-ready'));
  }

  initState() {
    this.state = {};
    this.schema.controls?.forEach((ctrl) => {
      if (ctrl.default !== undefined) {
        this.state[ctrl.key] = ctrl.default;
      }
    });
  }

  collectOriginalTokens() {
    const computed = getComputedStyle(this.previewInner || document.body);
    this.schema.tokens?.forEach(token => {
      const value = computed.getPropertyValue(token).trim();
      this.originalTokens[token] = value;
    });
  }

  renderShell() {
    this.host.classList.add('ui-playground');
    if (this.schema.controls?.length === 0) {
      this.host.classList.add('ui-playground--minimal');
    }

    this.host.innerHTML = html`
      <div class="ui-playground__globals" data-section="globals"></div>
      <div class="ui-playground__preview" data-section="preview">
        <div class="ui-playground__preview-inner" data-preview-inner></div>
      </div>
      <div class="ui-playground__controls" data-section="controls"></div>
      <div class="ui-playground__code" data-section="code">
        <div class="ui-playground__code-header">
          <span class="ui-playground__code-title">HTML</span>
          <button type="button" class="ui-button ui-button--ghost ui-button--sm ui-playground__code-copy" data-copy-btn>
            <i class="fa fa-copy" aria-hidden="true"></i> Copy
          </button>
        </div>
        <div class="ui-playground__code-body">
          <pre data-code-body></pre>
        </div>
      </div>
      <div class="ui-playground__tokens" data-section="tokens">
        <div class="ui-playground__tokens-header">
          <span class="ui-playground__tokens-title">Tokens</span>
        </div>
        <div class="ui-playground__tokens-body" data-tokens-body></div>
      </div>
    `;

    this.previewInner = this.host.querySelector('[data-preview-inner]');
    this.codeBody = this.host.querySelector('[data-code-body]');
    this.tokensBody = this.host.querySelector('[data-tokens-body]');
    this.controlsSection = this.host.querySelector('[data-section="controls"]');
    this.globalsSection = this.host.querySelector('[data-section="globals"]');

    this.host.querySelector('[data-copy-btn]').addEventListener('click', () => this.copyCode());
  }

  renderControls() {
    if (!this.schema.controls) return;

    const controls = this.schema.controls;
    const controlsHtml = controls.map(ctrl => this.renderControl(ctrl)).join('');

    const section = document.createElement('div');
    section.className = 'ui-card ui-playground__section';
    section.innerHTML = html`
      <div class="ui-playground__section-title">Controls</div>
      ${controlsHtml}
    `;

    this.controlsSection.appendChild(section);

    controls.forEach(ctrl => {
      this.bindControlEvents(ctrl);
    });
  }

  renderControl(ctrl) {
    const id = `ctrl-${ctrl.key}`;
    let inputHtml = '';

    switch (ctrl.type) {
      case 'segmented':
        inputHtml = ctrl.options.map(opt => html`
          <button
            type="button"
            class="ui-chip ui-chip--sm ${this.state[ctrl.key] === opt ? 'ui-chip--active' : ''}"
            data-key="${ctrl.key}"
            data-value="${opt}"
            aria-pressed="${this.state[ctrl.key] === opt}"
          >${opt}</button>
        `).join('');
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <label class="ui-playground__control-label">${ctrl.label || ctrl.key}</label>
            <div class="u-cluster" role="group" aria-label="${ctrl.label || ctrl.key}">
              ${inputHtml}
            </div>
          </div>
        `;

      case 'select':
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <label class="ui-playground__control-label">${ctrl.label || ctrl.key}</label>
            <div class="ui-field ui-field--sm">
              <select class="ui-select" data-key="${ctrl.key}" style="width:100%">
                ${ctrl.options.map(opt => html`
                  <option value="${opt}" ${this.state[ctrl.key] === opt ? 'selected' : ''}>${opt}</option>
                `).join('')}
              </select>
            </div>
          </div>
        `;

      case 'range':
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <label class="ui-playground__control-label">
              ${ctrl.label || ctrl.key}: <strong>${this.state[ctrl.key]}${ctrl.unit || ''}</strong>
            </label>
            <div class="u-cluster u-cluster--compact">
              <input
                type="range"
                class="ui-slider ui-slider--sm"
                data-key="${ctrl.key}"
                min="${ctrl.min}"
                max="${ctrl.max}"
                step="${ctrl.step || 1}"
                value="${this.state[ctrl.key]}"
                style="flex:1"
              />
              <input
                type="number"
                class="ui-input ui-input--sm"
                data-key="${ctrl.key}"
                data-type="number"
                min="${ctrl.min}"
                max="${ctrl.max}"
                step="${ctrl.step || 1}"
                value="${this.state[ctrl.key]}"
                style="width:60px"
              />
            </div>
          </div>
        `;

      case 'text':
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <label class="ui-playground__control-label">${ctrl.label || ctrl.key}</label>
            <input
              type="text"
              class="ui-input ui-input--sm"
              data-key="${ctrl.key}"
              value="${this.state[ctrl.key] || ''}"
              style="width:100%"
            />
          </div>
        `;

      case 'toggle':
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <span class="ui-playground__control-label">${ctrl.label || ctrl.key}</span>
            <label class="ui-toggle ui-toggle--sm">
              <input
                type="checkbox"
                data-key="${ctrl.key}"
                ${this.state[ctrl.key] ? 'checked' : ''}
              />
            </label>
          </div>
        `;

      case 'color':
        return html`
          <div class="ui-playground__control" data-control="${ctrl.key}">
            <label class="ui-playground__control-label">${ctrl.label || ctrl.key}</label>
            <div class="u-cluster u-cluster--compact">
              <input
                type="color"
                class="ui-swatch"
                data-key="${ctrl.key}"
                value="${this.state[ctrl.key] || '#000000'}"
                style="width:32px;height:32px"
              />
              <input
                type="text"
                class="ui-input ui-input--sm"
                data-key="${ctrl.key}"
                data-type="color"
                value="${this.state[ctrl.key] || '#000000'}"
                style="width:100px"
              />
            </div>
          </div>
        `;

      default:
        return html`<div class="ui-playground__control">Unknown control type: ${ctrl.type}</div>`;
    }
  }

  bindControlEvents(ctrl) {
    const container = this.host.querySelector(`[data-control="${ctrl.key}"]`);
    if (!container) return;

    switch (ctrl.type) {
      case 'segmented':
        container.querySelectorAll('[data-key]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.setState(ctrl.key, btn.dataset.value);
          });
        });
        break;

      case 'select':
        container.querySelector('select').addEventListener('change', e => {
          this.setState(ctrl.key, e.target.value);
        });
        break;

      case 'range':
        container.querySelectorAll('[data-key]').forEach(el => {
          el.addEventListener('input', e => {
            const val = el.dataset.type === 'number' ? parseFloat(e.target.value) : parseFloat(e.target.value);
            this.setState(ctrl.key, val);
          });
        });
        break;

      case 'text':
        container.querySelector('input').addEventListener('input', e => {
          this.setState(ctrl.key, e.target.value);
        });
        break;

      case 'toggle':
        container.querySelector('input[type="checkbox"]').addEventListener('change', e => {
          this.setState(ctrl.key, e.target.checked);
        });
        break;

      case 'color':
        const colorInput = container.querySelector('input[type="color"]');
        const textInput = container.querySelector('input[data-type="color"]');
        colorInput.addEventListener('input', e => {
          textInput.value = e.target.value;
          this.setState(ctrl.key, e.target.value);
        });
        textInput.addEventListener('input', e => {
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
            colorInput.value = e.target.value;
            this.setState(ctrl.key, e.target.value);
          }
        });
        break;
    }
  }

  setState(key, value) {
    const ctrl = this.schema.controls?.find(c => c.key === key);
    if (!ctrl) return;

    this.state[key] = value;
    if (ctrl.bindsVar) {
      this.changedTokens.add(ctrl.bindsVar);
    }
    this.updatePreview();
    this.updateCode();
    this.updateTokens();
    this.refreshSegmentedControlUI();
  }

  /** Синхронизация ui-chip--active с this.state (сегменты не перерисовываются целиком). */
  refreshSegmentedControlUI() {
    this.schema.controls?.forEach((c) => {
      if (c.type !== 'segmented') return;
      const container = this.host.querySelector(`[data-control="${c.key}"]`);
      if (!container) return;
      const val = this.state[c.key];
      container.querySelectorAll('[data-key][data-value]').forEach((btn) => {
        const on = btn.dataset.value === String(val);
        btn.classList.toggle('ui-chip--active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }

  applyTemplateBindings(html) {
    let out = html;
    this.schema.templateBindings?.forEach(({ placeholder, compute }) => {
      const token = `{${placeholder}}`;
      if (!out.includes(token)) return;
      const val = compute(this.state);
      out = out.split(token).join(val);
    });
    return out;
  }

  buildClassString() {
    const parts = [];
    if (this.schema.baseClass) {
      parts.push(...this.schema.baseClass.split(' ').filter(Boolean));
    }
    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl?.bindsClass) return;
      if (ctrl.omitClassForValues?.includes(value)) return;
      if (ctrl.type === 'toggle' && !value) return;
      ctrl.bindsClass.split('|').forEach((tmpl) => {
        const c = tmpl.replace('{value}', value);
        if (c) parts.push(c);
      });
    });
    return parts.join(' ');
  }

  updatePreview() {
    if (!this.schema.template || !this.previewInner) return;

    let html = this.applyTemplateBindings(this.schema.template);
    html = html.replace('{class}', this.buildClassString());

    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl?.bindsText) return;
      html = html.replace('{text}', value);
    });

    this.previewInner.innerHTML = html;

    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl) return;
      if (ctrl.bindsVar) {
        const cssValue = ctrl.unit ? `${value}${ctrl.unit}` : value;
        this.previewInner.style.setProperty(ctrl.bindsVar, cssValue);
      }
      if (ctrl.bindsAttr) {
        const el = this.previewInner.querySelector('[data-target]') || this.previewInner.firstElementChild;
        if (el) {
          if (value) el.setAttribute(ctrl.bindsAttr, '');
          else el.removeAttribute(ctrl.bindsAttr);
        }
      }
    });
  }

  updateCode() {
    if (!this.schema.template || !this.codeBody) return;

    let code = this.applyTemplateBindings(this.schema.template);
    code = code.replace('{class}', this.buildClassString());

    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl?.bindsText) return;
      code = code.replace('{text}', this.escapeHtml(String(value)));
    });

    code = this.formatHtml(code);
    this.codeBody.textContent = code;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  formatHtml(html) {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    html.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).forEach(node => {
      if (!node.trim()) return;

      if (node.match(/^<\/\w/)) {
        indent--;
      }

      formatted += tab.repeat(Math.max(0, indent)) + node.trim() + '\n';

      if (node.match(/^<\w[^>]*[^\/]$/) && !node.endsWith('/>')) {
        indent++;
      }
    });

    return formatted.trim();
  }

  updateTokens() {
    if (!this.tokensBody || !this.previewInner) return;
    if (!this.schema.tokens?.length) {
      this.tokensBody.innerHTML = '<div class="ui-text-body" style="color:var(--ui-color-text-muted);font-size:var(--ui-font-size-xs)">No tokens defined</div>';
      return;
    }

    const tokens = this.schema.tokens.map(token => {
      const computed = getComputedStyle(this.previewInner).getPropertyValue(token).trim();
      const isChanged = this.changedTokens.has(token);

      return html`
        <div class="ui-playground__token ${isChanged ? 'ui-playground__token--changed' : ''}">
          <span class="ui-playground__token-name">${token}</span>
          <span class="ui-playground__token-value">${computed || '—'}</span>
        </div>
      `;
    }).join('');

    this.tokensBody.innerHTML = tokens;
  }

  bindGlobalControls() {
    const themeValues = ['default', 'dark', 'midnight', 'corporate', 'warm'];
    const viewportValues = ['mobile', 'tablet', 'desktop'];

    const themeRow = this.options.hideThemeControls
      ? ''
      : html`
      <div class="ui-playground__globals-row" role="group" aria-label="Theme preset for preview">
        <span class="ui-playground__globals-label">Theme:</span>
        ${themeValues.map(t => html`
          <button type="button" class="ui-chip ui-chip--sm" data-theme="${t}">${t}</button>
        `).join('')}
      </div>
    `;

    const globalsHtml = html`
      ${themeRow}
      <div class="ui-playground__globals-row" role="group" aria-label="Preview width">
        <span class="ui-playground__globals-label">Viewport:</span>
        ${viewportValues.map(v => html`
          <button type="button" class="ui-chip ui-chip--sm" data-viewport="${v}">${v}</button>
        `).join('')}
      </div>
      <div class="ui-playground__globals-row" role="group" aria-label="Text direction">
        <span class="ui-playground__globals-label">Direction:</span>
        <button type="button" class="ui-chip ui-chip--sm" data-rtl="false">LTR</button>
        <button type="button" class="ui-chip ui-chip--sm" data-rtl="true">RTL</button>
      </div>
    `;

    this.globalsSection.innerHTML = globalsHtml;

    this.globalsSection.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });

    this.globalsSection.querySelectorAll('[data-viewport]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setViewport(btn.dataset.viewport);
      });
    });

    this.globalsSection.querySelectorAll('[data-rtl]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setRTL(btn.dataset.rtl === 'true');
      });
    });

    this.applyGlobalLayoutToPreview();
    this.refreshGlobalChips();
  }

  /** Только атрибуты превью + чипы; без updateTokens (контент ещё не собран). */
  applyGlobalLayoutToPreview() {
    if (!this.previewInner) return;
    const { theme, viewport, rtl } = this._global;
    this.previewInner.setAttribute('data-viewport', viewport);
    this.previewInner.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    if (theme !== 'default') {
      this.previewInner.setAttribute('data-theme', theme);
    } else {
      this.previewInner.removeAttribute('data-theme');
    }
  }

  refreshGlobalChips() {
    if (!this.globalsSection) return;
    const { theme, viewport, rtl } = this._global;

    this.globalsSection.querySelectorAll('[data-theme]').forEach((btn) => {
      const on = btn.dataset.theme === theme;
      btn.classList.toggle('ui-chip--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    this.globalsSection.querySelectorAll('[data-viewport]').forEach((btn) => {
      const on = btn.dataset.viewport === viewport;
      btn.classList.toggle('ui-chip--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    this.globalsSection.querySelectorAll('[data-rtl]').forEach((btn) => {
      const wantRtl = btn.dataset.rtl === 'true';
      const on = rtl === wantRtl;
      btn.classList.toggle('ui-chip--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  setTheme(theme) {
    if (!this.previewInner) return;
    this._global.theme = theme;
    this.previewInner.removeAttribute('data-theme');
    if (theme !== 'default') {
      this.previewInner.setAttribute('data-theme', theme);
    }
    this.refreshGlobalChips();
    this.updateTokens();
  }

  setViewport(viewport) {
    if (!this.previewInner) return;
    this._global.viewport = viewport;
    this.previewInner.setAttribute('data-viewport', viewport);
    this.refreshGlobalChips();
  }

  setRTL(rtl) {
    if (!this.previewInner) return;
    this._global.rtl = rtl;
    this.previewInner.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    this.refreshGlobalChips();
  }

  copyCode() {
    const code = this.codeBody.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = this.host.querySelector('[data-copy-btn]');
      btn.classList.add('ui-playground__code-copy--copied');
      btn.innerHTML = '<i class="fa fa-check"></i> Copied!';
      setTimeout(() => {
        btn.classList.remove('ui-playground__code-copy--copied');
        btn.innerHTML = '<i class="fa fa-copy"></i> Copy';
      }, 2000);
    });
  }

  exportState() {
    return {
      component: this.schema.component,
      state: { ...this.state },
      changedTokens: [...this.changedTokens]
    };
  }
}

export { Playground, html };