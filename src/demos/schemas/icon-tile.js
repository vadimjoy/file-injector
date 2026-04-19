export default {
  component: 'icon-tile',
  atomicLevel: 'atom',
  baseClass: 'ui-icon-tile',
  template: '<div class="{class}"><i class="fa fa-check"></i></div>',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['primary', 'success', 'warning', 'error', 'neutral', 'ghost'],
      default: 'primary',
      bindsClass: 'ui-icon-tile--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      bindsClass: 'ui-icon-tile--{value}'
    },
    {
      key: 'shape',
      type: 'segmented',
      label: 'Shape',
      options: ['default', 'circle', 'square'],
      default: 'default',
      bindsClass: 'ui-icon-tile--{value}'
    }
  ],
  tokens: [
    '--ai-icon-tile-size',
    '--ai-icon-tile-bg',
    '--ai-icon-tile-color',
    '--ai-icon-tile-radius'
  ]
};