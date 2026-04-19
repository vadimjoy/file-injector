export default {
  component: 'notification',
  atomicLevel: 'molecule',
  baseClass: 'ui-notification',
  template: `
    <div class="{class}">
      <div class="ui-notification__icon"><i class="fa fa-info-circle"></i></div>
      <div class="ui-notification__body">
        <div class="ui-notification__header">
          <span class="ui-notification__title">Notification</span>
          <span class="ui-notification__time">2 min ago</span>
        </div>
        <div class="ui-notification__text">This is a notification message.</div>
      </div>
    </div>
  `,
  controls: [
    {
      key: 'unread',
      type: 'toggle',
      label: 'Unread',
      default: false,
      bindsClass: 'ui-notification--unread'
    }
  ],
  tokens: [
    '--ai-notification-bg',
    '--ai-notification-border',
    '--ai-notification-radius'
  ]
};