export default {
  component: 'color-swatch',
  atomicLevel: 'atom',
  baseClass: 'ui-swatch',
  template: '<button class="{class}" style="background:#4f46e5" aria-pressed="false" aria-label="#4f46e5"></button>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'default', 'lg', 'xl'],
      default: 'default',
      bindsClass: 'ui-swatch--{value}'
    },
    {
      key: 'shape',
      type: 'segmented',
      label: 'Shape',
      options: ['default', 'square'],
      default: 'default',
      bindsClass: 'ui-swatch--{value}'
    },
    {
      key: 'selected',
      type: 'toggle',
      label: 'Selected',
      default: false,
      bindsClass: 'ui-swatch--selected'
    }
  ],
  tokens: [
    '--ai-swatch-size',
    '--ai-swatch-radius',
    '--ai-swatch-border-color'
  ]
};