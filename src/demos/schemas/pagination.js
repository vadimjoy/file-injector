export default {
  component: 'pagination',
  atomicLevel: 'molecule',
  baseClass: 'ui-pagination',
  template: `
    <nav class="{class}">
      <button class="ui-pagination__item ui-pagination__item--prev"><i class="fa fa-chevron-left"></i></button>
      <button class="ui-pagination__item">1</button>
      <button class="ui-pagination__item ui-pagination__item--active">2</button>
      <button class="ui-pagination__item">3</button>
      <span class="ui-pagination__ellipsis">…</span>
      <button class="ui-pagination__item">10</button>
      <button class="ui-pagination__item ui-pagination__item--next"><i class="fa fa-chevron-right"></i></button>
    </nav>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'lg'],
      default: 'sm',
      bindsClass: 'ui-pagination--{value}'
    }
  ],
  tokens: [
    '--ai-pagination-bg',
    '--ai-pagination-color',
    '--ai-pagination-active-bg',
    '--ai-pagination-radius'
  ]
};