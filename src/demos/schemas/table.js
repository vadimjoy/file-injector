export default {
  component: 'table',
  atomicLevel: 'organism',
  baseClass: 'ui-table-wrap',
  template: `
    <div class="{class}">
      <table class="ui-table">
        <thead>
          <tr>
            <th class="ui-table__th">Name</th>
            <th class="ui-table__th">Email</th>
            <th class="ui-table__th">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="ui-table__td">Alice Smith</td>
            <td class="ui-table__td">alice@example.com</td>
            <td class="ui-table__td">Admin</td>
          </tr>
          <tr>
            <td class="ui-table__td">Bob Johnson</td>
            <td class="ui-table__td">bob@example.com</td>
            <td class="ui-table__td">User</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  controls: [
    {
      key: 'style',
      type: 'segmented',
      label: 'Style',
      options: ['default', 'bordered', 'striped'],
      default: 'default',
      bindsClass: 'ui-table--{value}'
    }
  ],
  tokens: [
    '--ai-table-bg',
    '--ai-table-border-color',
    '--ai-table-header-bg',
    '--ai-table-radius'
  ]
};