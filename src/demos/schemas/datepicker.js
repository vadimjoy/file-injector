export default {
  component: 'datepicker',
  atomicLevel: 'molecule',
  baseClass: 'ui-datepicker',
  template: `
    <div class="{class}">
      <div class="ui-datepicker__trigger">
        <input type="text" class="ui-input ui-input--icon-right ui-input--readonly ui-datepicker__input" placeholder="Select date" readonly>
        <i class="fa fa-calendar ui-datepicker__icon"></i>
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-datepicker-bg',
    '--ai-datepicker-border',
    '--ai-datepicker-radius',
    '--ai-datepicker-icon-color'
  ]
};