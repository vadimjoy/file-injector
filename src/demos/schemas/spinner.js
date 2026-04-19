export default {
  component: 'spinner',
  atomicLevel: 'atom',
  baseClass: 'ui-spinner',
  template: '<span class="{class}" aria-label="Loading"></span>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-spinner--{value}'
    },
    {
      key: 'inverted',
      type: 'toggle',
      label: 'Inverted',
      default: false,
      bindsClass: 'ui-spinner--inverted'
    }
  ],
  tokens: [
    '--ai-spinner-color',
    '--ai-spinner-size'
  ]
};