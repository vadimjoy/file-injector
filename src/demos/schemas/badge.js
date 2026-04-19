export default {
  component: 'badge',
  atomicLevel: 'atom',
  baseClass: 'ui-badge',
  template: '<span class="{class}">Badge</span>',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['default', 'primary', 'success', 'warning', 'error'],
      default: 'primary',
      bindsClass: 'ui-badge--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-badge--{value}'
    },
    {
      key: 'dot',
      type: 'toggle',
      label: 'Show dot',
      default: false,
      bindsClass: 'ui-badge--dot'
    },
    {
      key: 'label',
      type: 'text',
      label: 'Label',
      default: 'Badge',
      bindsText: true
    }
  ],
  tokens: [
    '--ai-badge-bg',
    '--ai-badge-color',
    '--ai-badge-radius',
    '--ai-badge-font-size',
    '--ai-badge-padding-x'
  ]
};