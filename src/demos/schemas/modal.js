export default {
  component: 'modal',
  atomicLevel: 'organism',
  baseClass: 'ui-modal',
  template: `
    <div class="{class}" role="dialog" aria-modal="true">
      <div class="ui-modal__content">
        <div class="ui-modal__header">
          <span class="ui-modal__title">Modal Title</span>
          <button class="ui-modal__close"><i class="fa fa-times"></i></button>
        </div>
        <div class="ui-modal__body">Modal body content goes here.</div>
        <div class="ui-modal__footer">
          <button class="ui-button ui-button--ghost ui-button--md">Cancel</button>
          <button class="ui-button ui-button--primary ui-button--md">Confirm</button>
        </div>
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-modal-bg',
    '--ai-modal-radius',
    '--ai-modal-shadow',
    '--ai-modal-backdrop-bg'
  ]
};