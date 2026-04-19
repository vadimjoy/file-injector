export default {
  component: 'button',
  atomicLevel: 'atom',
  baseClass: 'ui-button',
  template: '<button class="{class}" data-target>{text}</button>',
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['primary', 'secondary', 'ghost'],
      default: 'primary',
      bindsClass: 'ui-button--{value}'
    },
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-button--{value}'
    },
    {
      key: 'label',
      type: 'text',
      label: 'Label',
      default: 'Click me',
      bindsText: true
    },
    {
      key: 'disabled',
      type: 'toggle',
      label: 'Disabled',
      default: false,
      bindsAttr: 'disabled'
    },
    {
      key: 'radius',
      type: 'range',
      label: 'Radius',
      min: 0,
      max: 24,
      step: 2,
      default: 8,
      unit: 'px',
      bindsVar: '--ai-button-radius'
    },
    {
      key: 'fontSize',
      type: 'range',
      label: 'Font size',
      min: 11,
      max: 20,
      step: 1,
      default: 14,
      unit: 'px',
      bindsVar: '--ai-button-font-size'
    }
  ],
  tokens: [
    '--ai-button-bg',
    '--ai-button-bg-hover',
    '--ai-button-color',
    '--ai-button-radius',
    '--ai-button-font-size',
    '--ai-button-font-weight',
    '--ai-button-padding-x'
  ]
};