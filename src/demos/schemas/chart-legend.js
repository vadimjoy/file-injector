export default {
  component: 'chart-legend',
  atomicLevel: 'organism',
  baseClass: 'ui-chart-legend',
  template: `
    <div class="{class}">
      <div class="ui-chart-legend__item">
        <span class="ui-chart-legend__dot ui-dot ui-dot--sm ui-dot--primary"></span>
        <span class="ui-chart-legend__label">Series A</span>
      </div>
      <div class="ui-chart-legend__item">
        <span class="ui-chart-legend__dot ui-dot ui-dot--sm ui-dot--success"></span>
        <span class="ui-chart-legend__label">Series B</span>
      </div>
      <div class="ui-chart-legend__item">
        <span class="ui-chart-legend__dot ui-dot ui-dot--sm ui-dot--warning"></span>
        <span class="ui-chart-legend__label">Series C</span>
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-chart-legend-label-color',
    '--ai-chart-legend-dot-size'
  ]
};