export default {
  component: 'tooltip',
  atomicLevel: 'atom',
  baseClass: 'ui-tooltip',
  template: `
    <div class="u-relative" style="display:inline-block">
      <button class="ui-button ui-button--md ui-button--ghost">Hover me</button>
      <div class="{class}" role="tooltip">Tooltip text</div>
    </div>
  `,
  controls: [
    {
      key: 'position',
      type: 'segmented',
      label: 'Position',
      options: ['top', 'bottom', 'left', 'right'],
      default: 'top',
      bindsClass: 'ui-tooltip--{value}'
    }
  ],
  tokens: [
    '--ai-tooltip-bg',
    '--ai-tooltip-color',
    '--ai-tooltip-radius',
    '--ai-tooltip-font-size'
  ]
};