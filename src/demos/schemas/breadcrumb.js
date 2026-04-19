export default {
  component: 'breadcrumb',
  atomicLevel: 'molecule',
  baseClass: 'ui-breadcrumb',
  template: `
    <nav class="{class}" aria-label="Breadcrumb">
      <ol class="ui-breadcrumb__list">
        <li class="ui-breadcrumb__item"><a class="ui-breadcrumb__link" href="#">Home</a></li>
        <li class="ui-breadcrumb__item"><a class="ui-breadcrumb__link" href="#">Components</a></li>
        <li class="ui-breadcrumb__item ui-breadcrumb__item--current"><span>Breadcrumb</span></li>
      </ol>
    </nav>
  `,
  controls: [],
  tokens: [
    '--ai-breadcrumb-color',
    '--ai-breadcrumb-separator-color',
    '--ai-breadcrumb-active-color'
  ]
};