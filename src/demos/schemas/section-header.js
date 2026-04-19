export default {
  component: 'section-header',
  atomicLevel: 'molecule',
  baseClass: 'ui-section-header',
  template: `
    <div class="{class}">
      <div class="ui-section-header__text">
        <div class="ui-section-header__title">Section Title</div>
        <div class="ui-section-header__subtitle">Optional subtitle text</div>
      </div>
      <div class="ui-section-header__actions">
        <button class="ui-button ui-button--sm ui-button--ghost">Action</button>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'xl'],
      default: 'sm',
      bindsClass: 'ui-section-header--{value}'
    },
    {
      key: 'divided',
      type: 'toggle',
      label: 'Divided',
      default: false,
      bindsClass: 'ui-section-header--divided'
    }
  ],
  tokens: [
    '--ai-section-header-title-color',
    '--ai-section-header-subtitle-color',
    '--ai-section-header-border-color'
  ]
};