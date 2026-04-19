export default {
  component: 'tabs',
  atomicLevel: 'organism',
  baseClass: 'ui-tabs',
  template: `
    <div class="{class}">
      <div class="ui-tabs__list" role="tablist">
        <button class="ui-tabs__item ui-tabs__item--active" role="tab" aria-selected="true">Tab 1</button>
        <button class="ui-tabs__item" role="tab" aria-selected="false">Tab 2</button>
        <button class="ui-tabs__item" role="tab" aria-selected="false">Tab 3</button>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'style',
      type: 'segmented',
      label: 'Style',
      options: ['underline', 'pills'],
      default: 'underline',
      bindsClass: 'ui-tabs--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-tabs--{value}'
    }
  ],
  tokens: [
    '--ai-tabs-color',
    '--ai-tabs-active-color',
    '--ai-tabs-border-color',
    '--ai-tabs-indicator-color'
  ]
};