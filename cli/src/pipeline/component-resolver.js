import { ResolverError } from '../providers/base.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderAttrs(attrs) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => v === '' ? k : `${k}="${escapeAttr(String(v))}"`)
    .join(' ');
}

function renderFieldWrapper(spec, innerHtml) {
  const size = spec.size ?? 'md';
  const labelHtml = spec.label
    ? `<label class="ui-label" for="${spec.id}">${escapeHtml(spec.label)}</label>`
    : '';
  const helperHtml = spec.helperText
    ? `<span class="ui-helper">${escapeHtml(spec.helperText)}</span>`
    : '';

  return [
    `<div class="ui-field ui-field--${size}">`,
    labelHtml ? `  ${labelHtml}` : '',
    `  ${innerHtml}`,
    helperHtml ? `  ${helperHtml}` : '',
    `</div>`,
  ].filter(Boolean).join('\n');
}

function buildInputClasses(spec) {
  const classes = ['ui-input'];
  if (spec.contextModifiers?.includes('icon-left')) classes.push('ui-input--icon-left');
  if (spec.contextModifiers?.includes('icon-right')) classes.push('ui-input--icon-right');
  if (spec.contextModifiers?.includes('search')) classes.push('ui-input--search');
  if (spec.contextModifiers?.includes('readonly')) classes.push('ui-input--readonly');
  if (spec.validationState) classes.push(`ui-input--${spec.validationState}`);
  return classes;
}

function buildInputAttrs(spec) {
  const inputType = spec.variant ?? 'text';
  const attrs = {
    type: inputType,
    id: spec.id,
    class: buildInputClasses(spec).join(' '),
  };

  if (spec.placeholder) attrs.placeholder = spec.placeholder;
  if (spec.value !== undefined) attrs.value = String(spec.value);
  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }
  if (spec.contextModifiers?.includes('readonly')) attrs.readonly = '';
  if (inputType === 'number') {
    if (spec.min !== undefined) attrs.min = String(spec.min);
    if (spec.max !== undefined) attrs.max = String(spec.max);
    if (spec.step !== undefined) attrs.step = String(spec.step);
  }
  if (spec.attributes) {
    Object.entries(spec.attributes).forEach(([k, v]) => { attrs[k] = v; });
  }
  return attrs;
}

function resolveInput(spec) {
  const attrs = buildInputAttrs(spec);
  const inputHtml = `<input ${renderAttrs(attrs)}>`;

  const needsWrapper = spec.contextModifiers?.some(m => ['icon-left', 'icon-right', 'search'].includes(m));
  const innerHtml = needsWrapper
    ? `<div class="ui-input-wrapper">\n  <span class="ui-input-icon" aria-hidden="true"><i class="fa fa-search"></i></span>\n  ${inputHtml}\n</div>`
    : inputHtml;

  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html: inputHtml,
    wrapperHtml,
    classes: buildInputClasses(spec),
    ariaAttributes: {
      ...(spec.required && { 'aria-required': 'true' }),
      ...(spec.disabled && { 'aria-disabled': 'true' }),
    },
  };
}

function resolveTextarea(spec) {
  const classes = ['ui-textarea'];
  if (spec.validationState) classes.push(`ui-textarea--${spec.validationState}`);

  const attrs = {
    id: spec.id,
    class: classes.join(' '),
    rows: spec.rows ?? 3,
  };

  if (spec.placeholder) attrs.placeholder = spec.placeholder;
  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }
  if (spec.readonly) attrs.readonly = '';

  const textareaHtml = `<textarea ${renderAttrs(attrs)}></textarea>`;
  const wrapperHtml = renderFieldWrapper(spec, textareaHtml);

  return {
    spec,
    html: textareaHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {
      ...(spec.required && { 'aria-required': 'true' }),
      ...(spec.disabled && { 'aria-disabled': 'true' }),
    },
  };
}

function resolveSelect(spec) {
  const classes = ['ui-select'];
  if (spec.validationState) classes.push(`ui-select--${spec.validationState}`);

  const attrs = {
    id: spec.id,
    class: classes.join(' '),
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true' }

  const optionsHtml = spec.options?.map(opt => {
    const optAttrs = { value: opt.value };
    if (opt.selected) optAttrs.selected = '';
    if (opt.disabled) optAttrs.disabled = '';
    return `  <option ${renderAttrs(optAttrs)}>${escapeHtml(opt.label ?? opt.value)}</option>`;
  }).join('\n') ?? '  <option value="">Select...</option>';

  const selectHtml = `<select ${renderAttrs(attrs)}>\n${optionsHtml}\n</select>`;
  const wrapperHtml = renderFieldWrapper(spec, selectHtml);

  return {
    spec,
    html: selectHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveCheckbox(spec) {
  const size = spec.size ?? 'md';
  const classes = ['ui-checkbox', `ui-checkbox--${size}`];

  const attrs = {
    type: 'checkbox',
    id: spec.id,
    class: classes.join(' '),
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }
  if (spec.checked) attrs.checked = '';

  const checkboxHtml = `<input ${renderAttrs(attrs)}>`;
  const labelHtml = spec.label
    ? `<label class="ui-checkbox__label" for="${spec.id}">${escapeHtml(spec.label)}</label>`
    : '';

  const innerHtml = `<div class="ui-checkbox__box"><i class="fa fa-check"></i></div>${checkboxHtml}${labelHtml}`;
  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html: checkboxHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveRadio(spec) {
  const size = spec.size ?? 'md';
  const classes = ['ui-radio', `ui-radio--${size}`];

  const attrs = {
    type: 'radio',
    id: spec.id,
    class: classes.join(' '),
    name: spec.name ?? `${spec.type}-group`,
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }
  if (spec.checked) attrs.checked = '';

  const radioHtml = `<input ${renderAttrs(attrs)}>`;
  const labelHtml = spec.label
    ? `<label class="ui-radio__label" for="${spec.id}">${escapeHtml(spec.label)}</label>`
    : '';

  const innerHtml = `<div class="ui-radio__box"></div>${radioHtml}${labelHtml}`;
  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html: radioHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveToggle(spec) {
  const size = spec.size ?? 'md';
  const classes = ['ui-toggle', `ui-toggle--${size}`];

  const attrs = {
    type: 'checkbox',
    role: 'switch',
    id: spec.id,
    class: classes.join(' '),
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }
  if (spec.checked) { attrs.checked = ''; attrs['aria-checked'] = 'true'; }

  const toggleHtml = `<input ${renderAttrs(attrs)}>`;
  const innerHtml = `${toggleHtml}<span class="ui-toggle__track"><span class="ui-toggle__thumb"></span></span>`;
  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html: toggleHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveSlider(spec) {
  const size = spec.size ?? 'md';
  const classes = ['ui-slider', `ui-slider--${size}`];

  const attrs = {
    type: 'range',
    id: spec.id,
    class: classes.join(' '),
    min: spec.min ?? 0,
    max: spec.max ?? 100,
    step: spec.step ?? 1,
    value: spec.value ?? 50,
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }

  const sliderHtml = `<input ${renderAttrs(attrs)}>`;
  const wrapperHtml = renderFieldWrapper(spec, sliderHtml);

  return {
    spec,
    html: sliderHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveFileUpload(spec) {
  const size = spec.size ?? 'sm';
  const classes = ['ui-file-upload', `ui-file-upload--${size}`];

  const attrs = {
    type: 'file',
    id: spec.id,
    class: classes.join(' '),
  };

  if (spec.accept) attrs.accept = spec.accept;
  if (spec.multiple) attrs.multiple = '';
  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }

  const fileId = `file-upload-${spec.id}`;
  const inputHtml = `<input ${renderAttrs({ ...attrs, id: fileId })}>`;
  const labelHtml = spec.label
    ? `<label for="${fileId}" class="ui-file-upload__label"><i class="fa fa-cloud-upload"></i><span>${escapeHtml(spec.label)}</span></label>`
    : `<label for="${fileId}" class="ui-file-upload__label"><i class="fa fa-cloud-upload"></i><span>Drop files here or click to upload</span></label>`;

  const innerHtml = `${inputHtml}\n${labelHtml}`;
  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html: inputHtml,
    wrapperHtml,
    classes,
    ariaAttributes: {},
  };
}

function resolveButton(spec) {
  const variant = spec.variant ?? 'primary';
  const size = spec.size ?? 'md';
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`];

  const attrs = {
    type: 'submit',
    class: classes.join(' '),
  };

  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }

  const buttonHtml = `<button ${renderAttrs(attrs)}>${escapeHtml(spec.text ?? 'Submit')}</button>`;

  return {
    spec,
    html: buttonHtml,
    wrapperHtml: undefined,
    classes,
    ariaAttributes: {},
  };
}

function resolveBadge(spec) {
  const variant = spec.variant ?? 'primary';
  const size = spec.size ?? 'md';
  const classes = ['ui-badge', `ui-badge--${variant}`, `ui-badge--${size}`];
  if (spec.text?.toLowerCase().includes('live')) classes.push('ui-badge--live');
  if (spec.contextModifiers?.includes('dot')) classes.push('ui-badge--dot');

  const badgeHtml = `<span class="${classes.join(' ')}">${escapeHtml(spec.text ?? 'Badge')}</span>`;

  return {
    spec,
    html: badgeHtml,
    wrapperHtml: undefined,
    classes,
    ariaAttributes: {},
  };
}

function resolveCard(spec) {
  const classes = ['ui-card'];
  if (spec.variant === 'bordered') classes.push('ui-card--bordered');
  if (spec.variant === 'shadow') classes.push('ui-card--shadow');

  const headerHtml = spec.title
    ? `<div class="ui-card__header">${escapeHtml(spec.title)}</div>`
    : '';
  const bodyHtml = spec.text
    ? `<div class="ui-card__body">${escapeHtml(spec.text)}</div>`
    : '<div class="ui-card__body"></div>';

  const cardHtml = `<div class="${classes.join(' ')}">\n  ${headerHtml}\n  ${bodyHtml}\n</div>`;

  return {
    spec,
    html: cardHtml,
    wrapperHtml: undefined,
    classes,
    ariaAttributes: {},
  };
}

function resolveProgress(spec) {
  const variant = spec.variant ?? 'primary';
  const size = spec.size ?? 'md';
  const classes = ['ui-progress', `ui-progress--${variant}`, `ui-progress--${size}`];
  if (spec.contextModifiers?.includes('striped')) classes.push('ui-progress--striped');

  const value = spec.value ?? 60;
  const attrs = {
    class: classes.join(' '),
    role: 'progressbar',
    'aria-valuenow': String(value),
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  };

  const progressHtml = `<div ${renderAttrs(attrs)}><div class="ui-progress__fill" style="width:${value}%"></div></div>`;

  return {
    spec,
    html: progressHtml,
    wrapperHtml: undefined,
    classes,
    ariaAttributes: { 'aria-valuenow': String(value) },
  };
}

function resolveTooltip(spec) {
  const position = spec.contextModifiers?.find(m => ['top', 'bottom', 'left', 'right'].includes(m)) ?? 'top';
  const classes = ['ui-tooltip', `ui-tooltip--${position}`];

  const tooltipHtml = `<div class="${classes.join(' ')}" role="tooltip">${escapeHtml(spec.text ?? 'Tooltip')}</div>`;

  return {
    spec,
    html: tooltipHtml,
    wrapperHtml: undefined,
    classes,
    ariaAttributes: {},
  };
}

function resolveAutocomplete(spec) {
  const triggerId = spec.id;
  const panelId = `${spec.id}-panel`;

  const inputClasses = ['ui-input', 'ui-input--icon-left', 'ui-autocomplete__input'];
  const attrs = {
    type: 'text',
    id: triggerId,
    class: inputClasses.join(' '),
    placeholder: spec.placeholder ?? 'Search...',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    'aria-expanded': 'false',
    'aria-controls': panelId,
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }
  if (spec.disabled) { attrs.disabled = ''; attrs['aria-disabled'] = 'true'; }

  const triggerHtml = `<div class="ui-autocomplete__trigger"><i class="fa fa-search ui-autocomplete__search-icon" aria-hidden="true"></i><input ${renderAttrs(attrs)}></div>`;

  const panelHtml = `<div class="ui-autocomplete__panel" id="${panelId}" role="listbox" hidden></div>`;

  const autocompleteHtml = `<div class="ui-autocomplete">${triggerHtml}${panelHtml}</div>`;
  const wrapperHtml = renderFieldWrapper(spec, autocompleteHtml);

  return {
    spec,
    html: autocompleteHtml,
    wrapperHtml,
    classes: inputClasses,
    ariaAttributes: { 'aria-haspopup': 'listbox', 'aria-expanded': 'false' },
  };
}

function resolveDatepicker(spec) {
  const triggerId = spec.id;
  const panelId = `${spec.id}-panel`;
  const calendarId = `${spec.id}-calendar`;

  const inputClasses = ['ui-input', 'ui-input--icon-right', 'ui-input--readonly', 'ui-datepicker__input'];
  const attrs = {
    type: 'text',
    id: triggerId,
    class: inputClasses.join(' '),
    placeholder: spec.placeholder ?? 'Select date',
    readonly: '',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false',
    'aria-controls': panelId,
  };

  if (spec.required) { attrs.required = ''; attrs['aria-required'] = 'true'; }

  const triggerHtml = `<div class="ui-datepicker__trigger"><input ${renderAttrs(attrs)}><span class="ui-datepicker__icon" aria-hidden="true"><i class="fa fa-calendar"></i></span></div>`;

  const calendarHtml = `<div class="ui-datepicker__panel" id="${panelId}" role="dialog" aria-modal="true" hidden><div class="ui-calendar" id="${calendarId}" role="grid" aria-label="Date picker"><div class="ui-calendar__header"><button class="ui-button ui-button--ghost ui-button--sm" aria-label="Previous month">&#8249;</button><span class="ui-calendar__month-label" aria-live="polite"></span><button class="ui-button ui-button--ghost ui-button--sm" aria-label="Next month">&#8250;</button></div><div class="ui-calendar__grid" role="row"></div></div></div>`;

  const datepickerHtml = `<div class="ui-datepicker">${triggerHtml}${calendarHtml}</div>`;
  const wrapperHtml = renderFieldWrapper(spec, datepickerHtml);

  return {
    spec,
    html: datepickerHtml,
    wrapperHtml,
    classes: inputClasses,
    ariaAttributes: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
    requires: [],
  };
}

const RESOLVERS = {
  input: resolveInput,
  textarea: resolveTextarea,
  select: resolveSelect,
  checkbox: resolveCheckbox,
  radio: resolveRadio,
  toggle: resolveToggle,
  slider: resolveSlider,
  'file-upload': resolveFileUpload,
  button: resolveButton,
  badge: resolveBadge,
  card: resolveCard,
  progress: resolveProgress,
  tooltip: resolveTooltip,
  autocomplete: resolveAutocomplete,
  datepicker: resolveDatepicker,
};

export function resolveComponents(intent) {
  return intent.components.map((spec) => {
    const resolver = RESOLVERS[spec.type];
    if (!resolver) {
      throw new ResolverError(`Unknown component type: "${spec.type}"`);
    }
    return resolver(spec);
  });
}

export function getResolverMap() {
  return { ...RESOLVERS };
}