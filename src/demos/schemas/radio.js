export default {
  component: 'radio',
  atomicLevel: 'atom',
  baseClass: 'ui-radio',
  template:
    '<label class="{class}"><input type="radio" name="playground-radio" data-target><span>Radio option</span></label>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-radio--{value}'
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
    '--ai-radio-bg',
    '--ai-radio-border',
    '--ai-radio-radius',
    '--ai-radio-check-color'
  ]
};