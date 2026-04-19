export default {
  component: 'accordion',
  atomicLevel: 'organism',
  baseClass: 'ui-accordion',
  template: `
    <div class="{class}">
      <div class="ui-accordion__item ui-accordion__item--open">
        <button class="ui-accordion__trigger" aria-expanded="true">
          <span>Accordion Item 1</span>
          <i class="fa fa-chevron-down"></i>
        </button>
        <div class="ui-accordion__panel">Content for the first accordion item.</div>
      </div>
      <div class="ui-accordion__item">
        <button class="ui-accordion__trigger" aria-expanded="false">
          <span>Accordion Item 2</span>
          <i class="fa fa-chevron-down"></i>
        </button>
        <div class="ui-accordion__panel">Content for the second accordion item.</div>
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-accordion-bg',
    '--ai-accordion-border',
    '--ai-accordion-radius',
    '--ai-accordion-trigger-color'
  ]
};