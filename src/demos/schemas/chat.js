export default {
  component: 'chat',
  atomicLevel: 'organism',
  baseClass: 'ui-chat',
  template: `
    <div class="{class}">
      <div class="ui-chat__message ui-chat__message--received">
        <div class="ui-chat__bubble">Hello! How can I help?</div>
        <span class="ui-chat__time">10:30</span>
      </div>
      <div class="ui-chat__message ui-chat__message--sent">
        <div class="ui-chat__bubble">I need assistance with my order.</div>
        <span class="ui-chat__time">10:32</span>
      </div>
    </div>
  `,
  controls: [],
  tokens: [
    '--ai-chat-sent-bg',
    '--ai-chat-received-bg',
    '--ai-chat-radius',
    '--ai-chat-padding'
  ]
};