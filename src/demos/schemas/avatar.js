export default {
  component: 'avatar',
  atomicLevel: 'atom',
  baseClass: 'ui-avatar',
  template: '<div class="{class}"><i class="fa fa-user"></i></div>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg', 'xl'],
      default: 'md',
      bindsClass: 'ui-avatar--{value}'
    },
    {
      key: 'shape',
      type: 'segmented',
      label: 'Shape',
      options: ['default', 'square'],
      default: 'default',
      bindsClass: 'ui-avatar--{value}'
    },
    {
      key: 'status',
      type: 'segmented',
      label: 'Status',
      options: ['none', 'online', 'offline', 'busy'],
      default: 'none',
      bindsClass: 'ui-avatar--{value}'
    }
  ],
  tokens: [
    '--ai-avatar-size',
    '--ai-avatar-radius',
    '--ai-avatar-bg'
  ]
};