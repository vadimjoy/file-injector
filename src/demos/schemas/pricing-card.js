export default {
  component: 'pricing-card',
  atomicLevel: 'organism',
  baseClass: 'ui-pricing-card',
  template: `
    <div class="{class}">
      <div class="ui-pricing-card__header">
        <div class="ui-pricing-card__plan">Pro</div>
        <div class="ui-pricing-card__price">$29<span>/mo</span></div>
      </div>
      <ul class="ui-pricing-card__features">
        <li><i class="fa fa-check"></i> Unlimited projects</li>
        <li><i class="fa fa-check"></i> 10GB storage</li>
        <li><i class="fa fa-check"></i> Priority support</li>
      </ul>
      <button class="ui-button ui-button--primary ui-button--md ui-button--full">Get started</button>
    </div>
  `,
  controls: [
    {
      key: 'highlighted',
      type: 'toggle',
      label: 'Highlighted',
      default: false,
      bindsClass: 'ui-pricing-card--highlighted'
    }
  ],
  tokens: [
    '--ai-pricing-card-bg',
    '--ai-pricing-card-border',
    '--ai-pricing-card-radius',
    '--ai-pricing-card-highlighted-bg'
  ]
};