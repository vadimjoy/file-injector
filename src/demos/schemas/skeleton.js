export default {
  component: 'skeleton',
  atomicLevel: 'atom',
  baseClass: 'ui-skeleton',
  template: '<span class="{class}" style="width:100px;height:20px"></span>',
  controls: [
    {
      key: 'shape',
      type: 'segmented',
      label: 'Shape',
      options: ['text', 'circle', 'rounded'],
      default: 'text',
      bindsClass: 'ui-skeleton--{value}'
    },
    {
      key: 'animation',
      type: 'segmented',
      label: 'Animation',
      options: ['shimmer', 'pulse', 'static'],
      default: 'shimmer',
      bindsClass: 'ui-skeleton--{value}'
    }
  ],
  tokens: [
    '--ai-skeleton-bg',
    '--ai-skeleton-highlight',
    '--ai-skeleton-radius',
    '--ai-skeleton-duration'
  ]
};