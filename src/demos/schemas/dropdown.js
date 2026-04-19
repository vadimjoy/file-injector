export default {
  component: 'dropdown',
  atomicLevel: 'molecule',
  baseClass: 'ui-dropdown',
  template: `
    <div class="ui-dropdown">
      <button class="ui-button ui-button--md ui-button--secondary ui-dropdown__trigger">Dropdown <i class="fa fa-chevron-down"></i></button>
      <div class="{class} ui-dropdown__menu">
        <button class="ui-dropdown__item">Action 1</button>
        <button class="ui-dropdown__item">Action 2</button>
        <button class="ui-dropdown__separator"></button>
        <button class="ui-dropdown__item ui-dropdown__item--danger">Danger action</button>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'align',
      type: 'segmented',
      label: 'Align',
      options: ['left', 'right'],
      default: 'left',
      bindsClass: 'ui-dropdown__menu--{value}'
    }
  ],
  tokens: [
    '--ai-dropdown-bg',
    '--ai-dropdown-border',
    '--ai-dropdown-radius',
    '--ai-dropdown-shadow'
  ]
};