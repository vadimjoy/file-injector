export default {
  component: 'checkbox',
  atomicLevel: 'atom',
  baseClass: 'ui-checkbox',
  template: `
    <label class="ui-field">
      <input type="checkbox" class="{class}" data-target>
      <span class="ui-checkbox__box"><i class="fa fa-check"></i></span>
      <span class="ui-checkbox__label">Checkbox label</span>
    </label>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-checkbox--{value}'
    },
    {
      key: 'checked',
      type: 'toggle',
      label: 'Checked',
      default: false,
      bindsAttr: 'checked'
    },
    {
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsAttr: 'disabled'
    }
  ],
  tokens: [
    '--ai-checkbox-bg',
    '--ai-checkbox-border',
    '--ai-checkbox-radius',
    '--ai-checkbox-check-color'
  ]
};