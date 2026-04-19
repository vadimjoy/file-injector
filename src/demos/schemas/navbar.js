export default {
  component: 'navbar',
  atomicLevel: 'organism',
  baseClass: 'ui-navbar',
  template: `
    <nav class="{class}">
      <div class="ui-navbar__brand">Brand</div>
      <div class="ui-navbar__menu">
        <a class="ui-navbar__item ui-navbar__item--active" href="#">Home</a>
        <a class="ui-navbar__item" href="#">About</a>
        <a class="ui-navbar__item" href="#">Contact</a>
      </div>
    </nav>
  `,
  controls: [],
  tokens: [
    '--ai-navbar-bg',
    '--ai-navbar-height',
    '--ai-navbar-item-color',
    '--ai-navbar-item-hover-bg'
  ]
};