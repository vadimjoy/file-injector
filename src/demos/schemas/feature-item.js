export default {
  component: 'feature-item',
  atomicLevel: 'organism',
  baseClass: 'ui-feature',
  template: `
    <div class="{class}">
      <div class="ui-feature__icon ui-icon-tile ui-icon-tile--primary ui-icon-tile--md">
        <i class="fa fa-bolt"></i>
      </div>
      <div class="ui-feature__body">
        <div class="ui-feature__title">Feature Title</div>
        <div class="ui-feature__desc">Description of the feature that highlights its benefits.</div>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'layout',
      type: 'segmented',
      label: 'Layout',
      options: ['default', 'stacked'],
      default: 'default',
      bindsClass: 'ui-feature--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Icon size',
      options: ['sm', 'lg'],
      default: 'sm',
      bindsClass: 'ui-feature--{value}'
    }
  ],
  tokens: [
    '--ai-feature-icon-size',
    '--ai-feature-icon-bg',
    '--ai-feature-title-color'
  ]
};