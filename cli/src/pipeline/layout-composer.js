import { ResolverError } from '../providers/base.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}

function indent(str, spaces = 2) {
  const pad = ' '.repeat(spaces);
  return str.split('\n').map(line => (line.trim() ? pad + line : line)).join('\n');
}

function wrapInForm(intent, innerHtml) {
  const role = intent.accessibility?.formRole ?? 'form';
  const roleAttr = role !== 'none' ? ` role="${role}"` : '';
  const ariaLabel = intent.title ? ` aria-label="${escapeAttr(intent.title)}"` : '';
  const novalidate = ' novalidate';
  return `<form${roleAttr}${ariaLabel}${novalidate}>\n${indent(innerHtml)}\n</form>`;
}

function wrapInContainer(intent, innerHtml) {
  const header = buildHeader(intent);

  switch (intent.container) {
    case 'card':
      return [
        `<div class="ui-card">`,
        header ? `  <div class="ui-card__header">${header}</div>` : '',
        `  <div class="ui-card__body">`,
        indent(innerHtml, 4),
        `  </div>`,
        `</div>`,
      ].filter(Boolean).join('\n');

    case 'section':
      const level = intent.accessibility?.headingLevel ?? 2;
      return [
        `<section>`,
        header ? `  <h${level}>${header}</h${level}>` : '',
        indent(innerHtml),
        `</section>`,
      ].filter(Boolean).join('\n');

    default:
      return header ? `${header}\n${innerHtml}` : innerHtml;
  }
}

function buildHeader(intent) {
  const parts = [];
  if (intent.title) parts.push(escapeHtml(intent.title));
  if (intent.description) parts.push(`<p>${escapeHtml(intent.description)}</p>`);
  return parts.join('\n');
}

export function composeLayout(intent, atoms) {
  if (!atoms || atoms.length === 0) {
    throw new ResolverError('No components to compose');
  }

  const sortedAtoms = [...atoms].sort((a, b) => (a.spec.position ?? 0) - (b.spec.position ?? 0));

  const innerHtml = sortedAtoms
    .map(atom => atom.wrapperHtml ?? atom.html)
    .join('\n\n');

  const formWrapped = intent.layout === 'form'
    ? wrapInForm(intent, innerHtml)
    : innerHtml;

  const containerWrapped = wrapInContainer(intent, formWrapped);

  return {
    html: containerWrapped,
    inlineStyles: undefined,
    requiredTheme: intent.theme ?? 'default',
    meta: {
      componentCount: atoms.length,
      layoutType: intent.layout,
      generatedAt: new Date().toISOString(),
    },
  };
}