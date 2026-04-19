export default {
  component: 'toggle',
  atomicLevel: 'atom',
  baseClass: 'ui-toggle',
  template: `
    <label class="ui-field">
      <input type="checkbox" class="{class}" data-target role="switch" aria-checked="false">
      <span class="ui-toggle__track">
        <span class="ui-toggle__thumb"></span>
      </span>
    </label>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-toggle--{value}'
    },
    {
      key: 'checked',
      type: 'toggle',
      label: 'On',
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
    '--ai-toggle-track-bg',
    '--ai-toggle-thumb-bg',
    '--ai-toggle-checked-bg'
  ]
};