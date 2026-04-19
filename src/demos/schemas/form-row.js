export default {
  component: 'form-row',
  atomicLevel: 'molecule',
  baseClass: 'ui-form-row',
  template: `
    <div class="{class}">
      <div class="ui-form-row__label">Setting name</div>
      <div class="ui-form-row__control"><input type="text" class="ui-input ui-input--md" value="Setting value"></div>
      <div class="ui-form-row__desc">Helper text for this setting.</div>
    </div>
  `,
  controls: [
    {
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsClass: 'ui-form-row--disabled'
    }
  ],
  tokens: [
    '--ai-form-row-label-color',
    '--ai-form-row-desc-color',
    '--ai-form-row-gap'
  ]
};