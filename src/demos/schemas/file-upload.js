export default {
  component: 'file-upload',
  atomicLevel: 'molecule',
  baseClass: 'ui-file-upload',
  template: `
    <div class="{class}">
      <input type="file" class="ui-file-upload__input" id="file-upload">
      <label for="file-upload" class="ui-file-upload__label">
        <i class="fa fa-cloud-upload"></i>
        <span>Drop files here or click to upload</span>
      </label>
    </div>
  `,
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'lg'],
      default: 'sm',
      bindsClass: 'ui-file-upload--{value}'
    }
  ],
  tokens: [
    '--ai-file-upload-bg',
    '--ai-file-upload-border',
    '--ai-file-upload-radius',
    '--ai-file-upload-hover-bg'
  ]
};