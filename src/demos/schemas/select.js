export default {
  component: 'select',
  atomicLevel: 'atom',
  baseClass: 'ui-select',
  template: `
    <select class="{class}" data-target>
      <option>Option 1</option>
      <option>Option 2</option>
      <option>Option 3</option>
    </select>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-field--{value}'
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
    '--ai-select-bg',
    '--ai-select-border',
    '--ai-select-radius',
    '--ai-select-font-size'
  ]
};