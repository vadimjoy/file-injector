/* ==========================================================================
   AI CSS Kit — Playground Runtime
   Phase 4.3: Schema-driven interactive component demos
   Vanilla JS + ES Modules, no build step required
   ========================================================================== */

const html = (strings, ...values) => strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');

class Playground {
  constructor(host, schemaUrl) {
    this.host = host;
    this.schema = null;
    this.state = {};
    this.originalTokens = {};
    this.changedTokens = new Set();
    this.previewInner = null;
    this.codeBody = null;
    this.tokensBody = null;

    this.loadSchema(schemaUrl);
  }

  async loadSchema(url) {
    try {
      const module = await import(/* @vite-ignore */ url);
      this.schema = module.default || module;
      this.init();
    } catch (err) {
      console.error('Failed to load schema:', url, err);
      this.host.innerHTML = `<div class="ui-alert ui-alert--error">Failed to load schema: ${url}</div>`;
    }
  }

  init() {
    if (!this.schema) return;

    this.collectOriginalTokens();
    this.renderShell();
    this.bindGlobalControls();
    this.updatePreview();
    this.updateCode();
    this.updateTokens();
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
          <button class="ui-playground__code-copy" data-copy-btn>
            <i class="fa fa-copy"></i> Copy
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
    section.className = 'ui-playground__section';
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
            class="ui-chip ${this.state[ctrl.key] === opt ? 'ui-chip--active' : ''}"
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
            <select class="ui-select ui-select--sm" data-key="${ctrl.key}" style="width:100%">
              ${ctrl.options.map(opt => html`
                <option value="${opt}" ${this.state[ctrl.key] === opt ? 'selected' : ''}>${opt}</option>
              `).join('')}
            </select>
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
            <label class="u-cluster">
              <span>${ctrl.label || ctrl.key}</span>
              <input
                type="checkbox"
                class="ui-toggle ui-toggle--sm"
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
    this.applyBinding(ctrl);
    this.updatePreview();
    this.updateCode();
    this.updateTokens();
  }

  applyBinding(ctrl) {
    if (ctrl.bindsClass) {
      const classes = ctrl.bindsClass.split('|').map(tmpl => {
        const val = this.state[ctrl.key];
        return tmpl.replace('{value}', val);
      });

      const base = this.schema.baseClass || '';
      this.previewInner.className = 'ui-playground__preview-inner';
      if (base) this.previewInner.classList.add(...base.split(' ').filter(Boolean));

      if (ctrl.type === 'segmented') {
        this.previewInner.classList.remove(...ctrl.options.flatMap(o =>
          ctrl.bindsClass.split('|').map(tmpl => tmpl.replace('{value}', o))
        ));
      }
      this.previewInner.classList.add(...classes.filter(Boolean));
    }

    if (ctrl.bindsVar) {
      const val = this.state[ctrl.key];
      const cssValue = ctrl.unit ? `${val}${ctrl.unit}` : val;
      this.previewInner.style.setProperty(ctrl.bindsVar, cssValue);
      this.changedTokens.add(ctrl.bindsVar);
    }

    if (ctrl.bindsAttr) {
      if (ctrl.bindsAttr === 'disabled') {
        const el = this.previewInner.querySelector('[data-target]') || this.previewInner.firstElementChild;
        if (el) {
          if (this.state[ctrl.key]) {
            el.setAttribute('disabled', '');
          } else {
            el.removeAttribute('disabled');
          }
        }
      }
    }

    if (ctrl.bindsText) {
      const target = this.previewInner.querySelector(ctrl.target || '[data-target]') || this.previewInner.firstElementChild;
      if (target) {
        target.textContent = this.state[ctrl.key];
      }
    }
  }

  updatePreview() {
    if (!this.schema.template) return;

    let html = this.schema.template;
    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl) return;

      if (ctrl.bindsClass) {
        const classes = ctrl.bindsClass.split('|').map(tmpl => tmpl.replace('{value}', value)).join(' ');
        html = html.replace('{class}', classes);
      }
      if (ctrl.bindsText) {
        html = html.replace('{text}', value);
      }
    });

    const defaultClass = this.schema.baseClass || '';
    html = html.replace('{class}', defaultClass);

    this.previewInner.innerHTML = html;

    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl) return;
      if (ctrl.bindsVar) {
        const cssValue = ctrl.unit ? `${value}${ctrl.unit}` : value;
        this.previewInner.style.setProperty(ctrl.bindsVar, cssValue);
        this.changedTokens.add(ctrl.bindsVar);
      }
      if (ctrl.bindsAttr === 'disabled' && value) {
        const el = this.previewInner.firstElementChild;
        if (el) el.setAttribute('disabled', '');
      }
    });
  }

  updateCode() {
    if (!this.schema.template) return;

    let code = this.schema.template;
    Object.entries(this.state).forEach(([key, value]) => {
      const ctrl = this.schema.controls?.find(c => c.key === key);
      if (!ctrl) return;

      if (ctrl.bindsClass) {
        const classes = ctrl.bindsClass.split('|').map(tmpl => tmpl.replace('{value}', value)).join(' ');
        code = code.replace('{class}', classes);
      }
      if (ctrl.bindsText) {
        code = code.replace('{text}', this.escapeHtml(value));
      }
    });

    const defaultClass = this.schema.baseClass || '';
    code = code.replace('{class}', defaultClass);

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

    const globalsHtml = html`
      <div style="display:flex;gap:var(--ui-space-2);flex-wrap:wrap;align-items:center">
        <span style="font-size:var(--ui-font-size-xs);color:var(--ui-color-text-muted)">Theme:</span>
        ${themeValues.map(t => html`
          <button class="ui-chip ui-chip--sm" data-theme="${t}">${t}</button>
        `).join('')}
      </div>
      <div style="display:flex;gap:var(--ui-space-2);flex-wrap:wrap;align-items:center">
        <span style="font-size:var(--ui-font-size-xs);color:var(--ui-color-text-muted)">Viewport:</span>
        ${viewportValues.map(v => html`
          <button class="ui-chip ui-chip--sm" data-viewport="${v}">${v}</button>
        `).join('')}
      </div>
      <button class="ui-chip ui-chip--sm ui-chip--active" data-rtl="false">LTR</button>
      <button class="ui-chip ui-chip--sm" data-rtl="true">RTL</button>
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
  }

  setTheme(theme) {
    this.previewInner.removeAttribute('data-theme');
    if (theme !== 'default') {
      this.previewInner.setAttribute('data-theme', theme);
    }
    this.updateTokens();
  }

  setViewport(viewport) {
    this.previewInner.setAttribute('data-viewport', viewport);
  }

  setRTL(rtl) {
    this.previewInner.setAttribute('dir', rtl ? 'rtl' : 'ltr');
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