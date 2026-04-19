export default {
  component: 'textarea',
  atomicLevel: 'atom',
  baseClass: 'ui-textarea',
  template: '<textarea class="{class}" placeholder="Enter text..." rows="3" data-target></textarea>',
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
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsAttr: 'disabled'
    },
    {
      key: 'readonly',
      type: 'toggle',
      label: 'Readonly',
      default: false,
      bindsAttr: 'readonly'
    }
  ],
  tokens: [
    '--ai-textarea-bg',
    '--ai-textarea-border',
    '--ai-textarea-radius',
    '--ai-textarea-font-size'
  ]
};