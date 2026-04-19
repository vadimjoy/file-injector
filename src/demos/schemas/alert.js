export default {
  component: 'alert',
  atomicLevel: 'molecule',
  baseClass: 'ui-alert',
  template: `
    <div class="{class}" role="alert">
      <span class="ui-alert__icon">ℹ</span>
      <div class="ui-alert__content">
        <div class="ui-alert__title">Alert title</div>
        <div class="ui-alert__body">This is an alert message with important information.</div>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['info', 'success', 'warning', 'error', 'neutral'],
      default: 'info',
      bindsClass: 'ui-alert--{value}'
    },
    {
      key: 'style',
      type: 'segmented',
      label: 'Style',
      options: ['default', 'banner', 'callout'],
      default: 'default',
      bindsClass: 'ui-alert--{value}'
    },
    {
      key: 'accent',
      type: 'toggle',
      label: 'Left accent bar',
      default: false,
      bindsClass: 'ui-alert--accent'
    }
  ],
  tokens: [
    '--ai-alert-info-bg',
    '--ai-alert-success-bg',
    '--ai-alert-warning-bg',
    '--ai-alert-error-bg',
    '--ai-alert-radius',
    '--ai-alert-padding'
  ]
};