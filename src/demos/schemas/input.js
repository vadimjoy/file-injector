export default {
  component: 'input',
  atomicLevel: 'atom',
  baseClass: 'ui-input',
  template: '<input class="{class}" type="text" placeholder="Enter text..." data-target>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-field--{value}'
    },
    {
      key: 'icon',
      type: 'segmented',
      label: 'Icon',
      options: ['none', 'left', 'right'],
      default: 'none',
      bindsClass: 'ui-input--{value}'
    },
    {
      key: 'state',
      type: 'segmented',
      label: 'State',
      options: ['default', 'error', 'success', 'warning'],
      default: 'default',
      bindsClass: 'ui-input--{value}'
    },
    {
      key: 'readonly',
      type: 'toggle',
      label: 'Readonly',
      default: false,
      bindsAttr: 'readonly'
    },
    {
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsAttr: 'disabled'
    }
  ],
  tokens: [
    '--ai-input-bg',
    '--ai-input-border',
    '--ai-input-border-focus',
    '--ai-input-radius',
    '--ai-input-font-size',
    '--ai-input-height'
  ]
};