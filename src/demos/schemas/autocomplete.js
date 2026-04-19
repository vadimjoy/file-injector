export default {
  component: 'autocomplete',
  atomicLevel: 'molecule',
  baseClass: 'ui-autocomplete',
  template: `
    <div class="{class}">
      <div class="ui-autocomplete__trigger">
        <i class="fa fa-search ui-autocomplete__search-icon"></i>
        <input type="text" class="ui-input ui-input--icon-left ui-autocomplete__input" placeholder="Search...">
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-autocomplete-bg',
    '--ai-autocomplete-border',
    '--ai-autocomplete-radius'
  ]
};