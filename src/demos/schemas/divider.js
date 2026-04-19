export default {
  component: 'divider',
  atomicLevel: 'foundations',
  baseClass: 'ui-divider',
  template: '<hr class="{class}">',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['horizontal', 'thick', 'subtle', 'strong'],
      default: 'horizontal',
      bindsClass: 'ui-divider--{value}'
    }
  ],
  tokens: [
    '--ai-divider-color',
    '--ai-divider-thickness',
    '--ai-divider-margin'
  ]
};