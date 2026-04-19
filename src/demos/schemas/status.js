export default {
  component: 'status',
  atomicLevel: 'atom',
  baseClass: 'ui-status',
  template: '<span class="{class}"><span class="ui-status__dot"></span><span class="ui-status__label">Online</span></span>',
  controls: [
    {
      key: 'status',
      type: 'segmented',
      label: 'Status',
      options: ['online', 'offline', 'warning', 'error', 'pending'],
      default: 'online',
      bindsClass: 'ui-status--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-status--{value}'
    }
  ],
  tokens: [
    '--ai-status-dot-size',
    '--ai-status-online-color',
    '--ai-status-offline-color',
    '--ai-status-label-color'
  ]
};