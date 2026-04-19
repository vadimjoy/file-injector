export default {
  component: 'chip',
  atomicLevel: 'atom',
  baseClass: 'ui-chip',
  template: '<span class="{class}">Chip</span>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-chip--{value}'
    },
    {
      key: 'active',
      type: 'toggle',
      label: 'Active',
      default: false,
      bindsClass: 'ui-chip--active'
    },
    {
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsClass: 'ui-chip--disabled'
    }
  ],
  tokens: [
    '--ai-chip-bg',
    '--ai-chip-color',
    '--ai-chip-radius',
    '--ai-chip-font-size'
  ]
};