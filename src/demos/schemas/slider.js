export default {
  component: 'slider',
  atomicLevel: 'atom',
  baseClass: 'ui-slider',
  template: '<input type="range" class="{class}" min="0" max="100" value="50" data-target>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-slider--{value}'
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
    '--ai-slider-track',
    '--ai-slider-fill',
    '--ai-slider-thumb-bg'
  ]
};