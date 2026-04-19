export default {
  component: 'tag',
  atomicLevel: 'atom',
  baseClass: 'ui-tag',
  template: '<span class="{class}">Tag Label</span>',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['default', 'primary', 'success', 'warning', 'error'],
      default: 'primary',
      bindsClass: 'ui-tag--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-tag--{value}'
    },
    {
      key: 'removable',
      type: 'toggle',
      label: 'Removable',
      default: false,
      bindsClass: 'ui-tag--removable'
    }
  ],
  tokens: [
    '--ai-tag-bg',
    '--ai-tag-color',
    '--ai-tag-radius',
    '--ai-tag-font-size'
  ]
};