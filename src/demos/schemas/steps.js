export default {
  component: 'steps',
  atomicLevel: 'organism',
  baseClass: 'ui-steps',
  template: `
    <div class="{class}">
      <div class="ui-steps__item ui-steps__item--done">
        <div class="ui-steps__indicator"><i class="fa fa-check"></i></div>
        <div class="ui-steps__label">Step 1</div>
      </div>
      <div class="ui-steps__item ui-steps__item--active">
        <div class="ui-steps__indicator">2</div>
        <div class="ui-steps__label">Step 2</div>
      </div>
      <div class="ui-steps__item">
        <div class="ui-steps__indicator">3</div>
        <div class="ui-steps__label">Step 3</div>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'vertical',
      type: 'toggle',
      label: 'Vertical',
      default: false,
      bindsClass: 'ui-steps--vertical'
    }
  ],
  tokens: [
    '--ai-steps-done-bg',
    '--ai-steps-active-bg',
    '--ai-steps-pending-color',
    '--ai-steps-connector-color'
  ]
};