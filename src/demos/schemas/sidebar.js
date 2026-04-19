export default {
  component: 'sidebar',
  atomicLevel: 'organism',
  baseClass: 'ui-sidebar',
  template: `
    <aside class="{class}">
      <div class="ui-sidebar__header">
        <span class="ui-sidebar__logo">Logo</span>
      </div>
      <nav class="ui-sidebar__nav">
        <a class="ui-sidebar__item ui-sidebar__item--active" href="#"><i class="fa fa-home"></i> Dashboard</a>
        <a class="ui-sidebar__item" href="#"><i class="fa fa-user"></i> Profile</a>
        <a class="ui-sidebar__item" href="#"><i class="fa fa-cog"></i> Settings</a>
      </nav>
    </aside>
  `,
  controls: [
    {
      key: 'collapsed',
      type: 'toggle',
      label: 'Collapsed',
      default: false,
      bindsClass: 'ui-sidebar--collapsed'
    }
  ],
  tokens: [
    '--ai-sidebar-bg',
    '--ai-sidebar-width',
    '--ai-sidebar-item-color',
    '--ai-sidebar-item-active-bg'
  ]
};