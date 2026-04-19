export default {
  component: 'dot',
  atomicLevel: 'atom',
  baseClass: 'ui-dot',
  template: '<span class="{class}"></span>',
  controls: [
    {
      key: 'status',
      type: 'segmented',
      label: 'Status',
      options: ['online', 'offline', 'busy'],
      default: 'online',
      bindsClass: 'ui-dot--{value}'
    },
    {
      key: 'color',
      type: 'segmented',
      label: 'Color',
      options: ['primary', 'success', 'warning', 'error', 'neutral'],
      default: 'success',
      bindsClass: 'ui-dot--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      bindsClass: 'ui-dot--{value}'
    },
    {
      key: 'pulse',
      type: 'toggle',
      label: 'Pulse animation',
      default: false,
      bindsClass: 'ui-dot--pulse'
    }
  ],
  tokens: [
    '--ai-dot-size',
    '--ai-dot-color'
  ]
};