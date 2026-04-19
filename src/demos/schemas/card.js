export default {
  component: 'card',
  atomicLevel: 'molecule',
  baseClass: 'ui-card',
  template: `
    <div class="{class}">
      <div class="ui-card__header">Card Header</div>
      <div class="ui-card__body">Card body content goes here.</div>
      <div class="ui-card__footer">Card Footer</div>
    </div>
  `,
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['default', 'bordered', 'shadow'],
      default: 'default',
      bindsClass: 'ui-card--{value}'
    },
    {
      key: 'padding',
      type: 'segmented',
      label: 'Padding',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-card--{value}'
    }
  ],
  tokens: [
    '--ai-card-bg',
    '--ai-card-border',
    '--ai-card-radius',
    '--ai-card-shadow'
  ]
};