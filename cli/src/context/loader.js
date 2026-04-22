import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let _cachedContext = null;

export function loadAIContext() {
  if (_cachedContext) return _cachedContext;
  const path = resolve(PKG_ROOT, 'AI_CONTEXT.md');
  _cachedContext = readFileSync(path, 'utf8');
  return _cachedContext;
}

export function sliceForIntent(aiContext) {
  const lines = aiContext.split('\n');
  const sections = [];
  let currentSection = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith('## ') && (
      line.includes('Invariants') ||
      line.includes('Component Registry') ||
      line.includes('Composition Rules') ||
      line.includes('Anti-patterns')
    )) {
      if (currentSection.length > 0) {
        sections.push(currentSection.join('\n'));
      }
      currentSection = [line];
      inSection = true;
    } else if (line.startsWith('## ') && inSection) {
      sections.push(currentSection.join('\n'));
      currentSection = [line];
    } else if (inSection) {
      currentSection.push(line);
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection.join('\n'));
  }

  return sections.join('\n\n');
}

export function loadContextForIntent() {
  const full = loadAIContext();
  return sliceForIntent(full);
}