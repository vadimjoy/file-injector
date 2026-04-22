export default {
  component: 'checkbox',
  atomicLevel: 'atom',
  baseClass: 'ui-checkbox',
  template:
    '<label class="{class}"><input type="checkbox" data-target><span>Checkbox label</span></label>',
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