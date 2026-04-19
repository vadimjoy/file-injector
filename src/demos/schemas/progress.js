export default {
  component: 'progress',
  atomicLevel: 'atom',
  baseClass: 'ui-progress',
  template: '<div class="{class}" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><div class="ui-progress__fill" style="width:60%"></div></div>',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['primary', 'success', 'warning', 'error'],
      default: 'primary',
      bindsClass: 'ui-progress--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-progress--{value}'
    },
    {
      key: 'striped',
      type: 'toggle',
      label: 'Striped',
      default: false,
      bindsClass: 'ui-progress--striped'
    }
  ],
  tokens: [
    '--ai-progress-bg',
    '--ai-progress-fill',
    '--ai-progress-height',
    '--ai-progress-radius'
  ]
};