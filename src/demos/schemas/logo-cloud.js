export default {
  component: 'logo-cloud',
  atomicLevel: 'organism',
  baseClass: 'ui-logo-cloud',
  template: `
    <div class="{class}">
      <div class="ui-logo-cloud__item"><span style="font-weight:600;color:var(--ui-color-text-muted)">Company 1</span></div>
      <div class="ui-logo-cloud__item"><span style="font-weight:600;color:var(--ui-color-text-muted)">Company 2</span></div>
      <div class="ui-logo-cloud__item"><span style="font-weight:600;color:var(--ui-color-text-muted)">Company 3</span></div>
      <div class="ui-logo-cloud__item"><span style="font-weight:600;color:var(--ui-color-text-muted)">Company 4</span></div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-logo-cloud-item-opacity'
  ]
};