export default {
  component: 'timeline',
  atomicLevel: 'organism',
  baseClass: 'ui-timeline',
  template: `
    <div class="{class}">
      <div class="ui-timeline__item">
        <div class="ui-timeline__line">
          <div class="ui-timeline__dot ui-timeline__dot--primary"></div>
          <div class="ui-timeline__connector"></div>
        </div>
        <div class="ui-timeline__content">
          <span class="ui-timeline__time">10:00 AM</span>
          <div class="ui-timeline__title">Event Title</div>
          <div class="ui-timeline__desc">Description of the event.</div>
        </div>
      </div>
      <div class="ui-timeline__item">
        <div class="ui-timeline__line">
          <div class="ui-timeline__dot ui-timeline__dot--success"></div>
          <div class="ui-timeline__connector"></div>
        </div>
        <div class="ui-timeline__content">
          <span class="ui-timeline__time">12:30 PM</span>
          <div class="ui-timeline__title">Another Event</div>
          <div class="ui-timeline__desc">More details here.</div>
        </div>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'variant',
      type: 'segmented',
      label: 'Variant',
      options: ['default', 'compact', 'no-line'],
      default: 'default',
      bindsClass: 'ui-timeline--{value}'
    }
  ],
  tokens: [
    '--ai-timeline-dot-size',
    '--ai-timeline-connector-color',
    '--ai-timeline-dot-bg'
  ]
};