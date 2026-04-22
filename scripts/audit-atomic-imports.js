#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INDEX_CSS = path.join(__dirname, '..', 'src', 'css', 'index.css');

const LAYER_ORDER = ['foundations', 'atoms', 'molecules', 'organisms'];

const LAYER_MAP = {
  'divider.css': 'foundations',
  'kbd.css': 'foundations',
  'typography.css': 'foundations',
  'icon.css': 'foundations',
  'color.css': 'foundations',
  'button.css': 'atoms',
  'input.css': 'atoms',
  'select.css': 'atoms',
  'textarea.css': 'atoms',
  'checkbox.css': 'atoms',
  'radio.css': 'atoms',
  'toggle.css': 'atoms',
  'slider.css': 'atoms',
  'progress.css': 'atoms',
  'spinner.css': 'atoms',
  'avatar.css': 'atoms',
  'badge.css': 'atoms',
  'tag.css': 'atoms',
  'chip.css': 'atoms',
  'status.css': 'atoms',
  'dot.css': 'atoms',
  'tooltip.css': 'atoms',
  'skeleton.css': 'atoms',
  'icon-tile.css': 'atoms',
  'color-swatch.css': 'atoms',
  'card.css': 'molecules',
  'alert.css': 'molecules',
  'empty-state.css': 'molecules',
  'search.css': 'molecules',
  'file-upload.css': 'molecules',
  'autocomplete.css': 'molecules',
  'datepicker.css': 'molecules',
  'breadcrumb.css': 'molecules',
  'pagination.css': 'molecules',
  'dropdown.css': 'molecules',
  'rating.css': 'molecules',
  'stat-card.css': 'molecules',
  'notification.css': 'molecules',
  'form-row.css': 'molecules',
  'section-header.css': 'molecules',
  'accordion.css': 'organisms',
  'tabs.css': 'organisms',
  'table.css': 'organisms',
  'steps.css': 'organisms',
  'modal.css': 'organisms',
  'sidebar.css': 'organisms',
  'navbar.css': 'organisms',
  'timeline.css': 'organisms',
  'chat.css': 'organisms',
  'chart-legend.css': 'organisms',
  'logo-cloud.css': 'organisms',
  'footer.css': 'organisms',
  'pricing-card.css': 'organisms',
  'feature-item.css': 'organisms',
};

const ALLOWED_PRECEDENCE = {
  foundations: ['foundations', 'atoms'],
  atoms: ['foundations', 'atoms'],
  molecules: ['foundations', 'atoms', 'molecules'],
  organisms: ['foundations', 'atoms', 'molecules', 'organisms'],
};

function getLayer(file) {
  return LAYER_MAP[file] || null;
}

function parseIndex(css) {
  const imports = [];
  const importRegex = /@import\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(css)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

const content = fs.readFileSync(INDEX_CSS, 'utf8');
const imports = parseIndex(content);

const violations = [];

imports.forEach(function(importPath) {
  var file = path.basename(importPath);
  var layer = getLayer(file);
  if (!layer) return;

  var layerIndex = LAYER_ORDER.indexOf(layer);
  var allowedLayers = ALLOWED_PRECEDENCE[layer];

  for (var i = 0; i < imports.length; i++) {
    var prevFile = path.basename(imports[i]);
    var prevLayer = getLayer(prevFile);
    if (!prevLayer) continue;
    if (prevFile === file) break;

    var prevLayerIndex = LAYER_ORDER.indexOf(prevLayer);
    if (prevLayerIndex > layerIndex) {
      if (allowedLayers.indexOf(prevLayer) === -1) {
        violations.push({
          file: file,
          layer: layer,
          blockedBy: prevFile,
          blockedLayer: prevLayer
        });
      }
    }
  }
});

if (violations.length > 0) {
  console.error('\nATOMIC IMPORT VIOLATIONS (' + violations.length + ')\n');
  violations.forEach(function(v) {
    console.error(v.file + ' (' + v.layer + ') cannot import ' + v.blockedBy + ' (' + v.blockedLayer + ')');
  });
  console.error('\nRule: molecules can only import foundations+atoms; organisms can only import foundations+atoms+molecules');
  process.exit(1);
}

console.log('✓ Atomic import order validated (src/css/index.css)');
