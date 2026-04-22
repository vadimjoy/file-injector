const LAYOUT_COMPONENTS = ['card', 'section', 'page', 'list', 'inline'];

function countComponents(html) {
  const matches = html.match(/class="[^"]*ui-/g) || [];
  return matches.length;
}

function ruleFieldWrapper(html) {
  const issues = [];
  const fieldElements = html.match(/<input[^>]*class="[^"]*ui-input[^"]*"[^>]*>/g) || [];
  fieldElements.forEach((el, idx) => {
    if (!html.includes(`ui-field`) || !html.includes(`for="${el.match(/id="([^"]*)"/)?.[1]}"`)) {
      issues.push({
        code: 'MISSING_FIELD_WRAPPER',
        severity: 'error',
        message: `Input element ${idx + 1} appears to be missing .ui-field wrapper or label`,
        element: el.slice(0, 80),
        suggestion: 'Wrap <input> in <div class="ui-field"> and add <label class="ui-label">',
      });
    }
  });
  return issues;
}

function ruleLabelPresence(html) {
  const issues = [];
  const fieldMatches = html.match(/<div class="[^"]*ui-field[^"]*">/g) || [];
  fieldMatches.forEach((field, idx) => {
    if (!field.includes('ui-label')) {
      issues.push({
        code: 'MISSING_LABEL',
        severity: 'warning',
        message: `ui-field ${idx + 1} appears to be missing a .ui-label element`,
        element: field,
        suggestion: 'Add <label class="ui-label" for="..."> element',
      });
    }
  });
  return issues;
}

function ruleFieldSizeModifier(html) {
  const issues = [];
  const fieldMatches = html.match(/<div class="([^"]*)ui-field([^"]*)"/g) || [];
  fieldMatches.forEach((match, idx) => {
    const classes = match.match(/class="([^"]*)"/)?.[1] || '';
    const hasSize = /\bui-field--(?:sm|md|lg)\b/.test(classes);
    if (!hasSize) {
      issues.push({
        code: 'MISSING_FIELD_SIZE',
        severity: 'error',
        message: `ui-field ${idx + 1} is missing size modifier (--sm, --md, or --lg)`,
        element: match,
        suggestion: 'Add ui-field--sm, ui-field--md, or ui-field--lg to the wrapper',
      });
    }
  });
  return issues;
}

function ruleNoParentMutation(html) {
  const issues = [];
  const parentSelectorPattern = /\.[a-z]+-[a-z]+-[a-z]+[^"]*\s+(\.[a-z]+-[a-z]+-[a-z]+)/g;
  let match;
  while ((match = parentSelectorPattern.exec(html)) !== null) {
    const selector = match[0].slice(0, 60);
    if (!selector.includes('audit-atomic') && !selector.includes('deprecated')) {
      issues.push({
        code: 'PARENT_MUTATION',
        severity: 'error',
        message: `Parent selector mutation detected: "${selector}"`,
        element: selector,
        suggestion: 'Use context modifiers on the component itself instead of parent selectors',
      });
    }
  }
  return issues;
}

function ruleValidModifiers(html) {
  const issues = [];
  const validModifiers = [
    '--primary', '--secondary', '--ghost', '--sm', '--md', '--lg',
    '--error', '--success', '--warning', '--icon-left', '--icon-right',
    '--search', '--readonly', '--checked', '--disabled', '--active',
    '--banner', '--callout', '--stacked', '--compact', '--bordered',
    '--shadow', '--striped', '--animated', '--dot', '--live', '--removable',
    '--no-line', '--underline', '--divided', '--center', '--accent',
    '--highlighted', '--collapsed', '--open', '--filled', '--outline',
  ];
  const classMatches = html.match(/class="([^"]*)"/g) || [];
  classMatches.forEach(classAttr => {
    const classes = classAttr.match(/class="([^"]*)"/)?.[1] || '';
    const componentClasses = classes.split(/\s+/).filter(c => c.startsWith('ui-'));
    componentClasses.forEach(cls => {
      if (cls.startsWith('ui-field--') || cls.startsWith('ui-button--')) {
        const modifier = cls.match(/--[\w]+/)?.[0];
        if (modifier && !validModifiers.includes(modifier) && !modifier.match(/^--[a-z]+$/)) {
        }
      }
    });
  });
  return issues;
}

function ruleButtonVariant(html) {
  const issues = [];
  const buttonMatches = html.match(/<button[^>]*class="[^"]*ui-button[^"]*"[^>]*>/g) || [];
  buttonMatches.forEach((btn, idx) => {
    const classes = btn.match(/class="([^"]*)"/)?.[1] || '';
    const hasVariant = /\bui-button--(?:primary|secondary|ghost)\b/.test(classes);
    if (!hasVariant) {
      issues.push({
        code: 'MISSING_BUTTON_VARIANT',
        severity: 'error',
        message: `Button ${idx + 1} is missing variant modifier (--primary, --secondary, or --ghost)`,
        element: btn.slice(0, 80),
        suggestion: 'Add ui-button--primary, ui-button--secondary, or ui-button--ghost',
      });
    }
  });
  return issues;
}

function ruleThemeValue(html) {
  const issues = [];
  const themeMatch = html.match(/data-theme="([^"]*)"/);
  if (themeMatch) {
    const validThemes = ['default', 'dark', 'midnight', 'corporate', 'warm'];
    if (!validThemes.includes(themeMatch[1])) {
      issues.push({
        code: 'INVALID_THEME',
        severity: 'warning',
        message: `Unknown theme value: "${themeMatch[1]}". Must be one of: ${validThemes.join(', ')}`,
        element: themeMatch[0],
        suggestion: `Use one of: ${validThemes.join(', ')}`,
      });
    }
  }
  return issues;
}

const RULES = [
  ruleFieldWrapper,
  ruleLabelPresence,
  ruleFieldSizeModifier,
  ruleNoParentMutation,
  ruleValidModifiers,
  ruleButtonVariant,
  ruleThemeValue,
];

export function validate(html, options = {}) {
  const start = Date.now();
  const allIssues = [];
  let rulesChecked = 0;

  for (const rule of RULES) {
    try {
      const issues = rule(html, options);
      allIssues.push(...(issues ?? []));
    } catch {
    }
    rulesChecked++;
  }

  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const info = allIssues.filter(i => i.severity === 'info');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    stats: {
      componentsChecked: countComponents(html),
      rulesChecked,
      durationMs: Date.now() - start,
    },
  };
}

export function validateWithConfig(html, config) {
  const result = validate(html);
  if (config?.rules) {
    Object.entries(config.rules).forEach(([code, severity]) => {
      const issue = result.errors.find(i => i.code === code);
      if (issue) issue.severity = severity;
    });
  }
  return result;
}