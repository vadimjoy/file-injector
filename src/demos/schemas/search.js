export default {
  component: 'search',
  atomicLevel: 'molecule',
  baseClass: 'ui-search',
  template: `
    <div class="{class}">
      <i class="fa fa-search ui-search__icon"></i>
      <input type="search" class="ui-search__input" placeholder="Search...">
    </div>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-search--{value}'
    }
  ],
  tokens: [
    '--ai-search-bg',
    '--ai-search-border',
    '--ai-search-radius',
    '--ai-search-icon-color'
  ]
};