export default {
  component: 'input',
  atomicLevel: 'atom',
  baseClass: 'ui-input',
  template:
    '<div class="ui-field {fieldSize}"><input class="{class}" type="text" placeholder="Enter text..." data-target></div>',
  templateBindings: [
    {
      placeholder: 'fieldSize',
      compute: (s) => `ui-field--${s.size ?? 'md'}`,
    },
  ],
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    {
      key: 'icon',
      type: 'segmented',
      label: 'Icon',
      options: ['none', 'icon-left', 'icon-right'],
      default: 'none',
      bindsClass: 'ui-input--{value}',
      omitClassForValues: ['none'],
    },
    {
      key: 'state',
      type: 'segmented',
      label: 'State',
      options: ['default', 'error', 'success', 'warning'],
      default: 'default',
      bindsClass: 'ui-input--{value}',
      omitClassForValues: ['default'],
    },
    {
      key: 'readonly',
      type: 'toggle',
      label: 'Readonly',
      default: false,
      bindsAttr: 'readonly'
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
    '--ai-input-bg',
    '--ai-input-border',
    '--ai-input-border-focus',
    '--ai-input-radius',
    '--ai-input-font-size',
    '--ai-input-height'
  ]
};