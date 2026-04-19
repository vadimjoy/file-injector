export default {
  component: 'footer',
  atomicLevel: 'organism',
  baseClass: 'ui-footer',
  template: `
    <footer class="{class}">
      <div class="ui-footer__content">
        <p>&copy; 2026 AI CSS Kit. All rights reserved.</p>
      </div>
    </footer>
  `,
  controls: [],
  tokens: [
    '--ai-footer-bg',
    '--ai-footer-color',
    '--ai-footer-border-color'
  ]
};