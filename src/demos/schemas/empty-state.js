export default {
  component: 'empty-state',
  atomicLevel: 'molecule',
  baseClass: 'ui-empty-state',
  template: `
    <div class="{class}">
      <div class="ui-empty-state__icon"><i class="fa fa-inbox"></i></div>
      <div class="ui-empty-state__title">No items found</div>
      <div class="ui-empty-state__description">There are no items to display at this time.</div>
    </div>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'lg'],
      default: 'lg',
      bindsClass: 'ui-empty-state--{value}'
    }
  ],
  tokens: [
    '--ai-empty-state-icon-size',
    '--ai-empty-state-icon-color'
  ]
};