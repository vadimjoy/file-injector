export default {
  component: 'stat-card',
  atomicLevel: 'molecule',
  baseClass: 'ui-stat-card',
  template: `
    <div class="{class}">
      <div class="ui-stat-card__header">
        <span class="ui-stat-card__label">Total Revenue</span>
        <span class="ui-stat-card__icon"><i class="fa fa-dollar"></i></span>
      </div>
      <div class="ui-stat-card__value">$24,500</div>
      <div class="ui-stat-card__delta ui-stat-card__delta--positive">+12.5%</div>
    </div>
  `,
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Color',
      options: ['primary', 'success', 'warning', 'error'],
      default: 'primary',
      bindsClass: 'ui-stat-card--{value}'
    }
  ],
  tokens: [
    '--ai-stat-card-bg',
    '--ai-stat-card-border',
    '--ai-stat-card-radius',
    '--ai-stat-card-value-color'
  ]
};