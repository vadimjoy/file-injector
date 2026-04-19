export default {
  component: 'rating',
  atomicLevel: 'molecule',
  baseClass: 'ui-rating',
  template: '<div class="{class}"><i class="fa fa-star ui-rating__star ui-rating__star--filled"></i><i class="fa fa-star ui-rating__star ui-rating__star--filled"></i><i class="fa fa-star ui-rating__star ui-rating__star--filled"></i><i class="fa fa-star ui-rating__star ui-rating__star--filled"></i><i class="fa fa-star ui-rating__star"></i><span class="ui-rating__count">(128)</span></div>',
  controls: [
    {
      key: 'size',
      type: 'segmented',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      default: 'md',
      bindsClass: 'ui-rating--{value}'
    },
    {
      key: 'readonly',
      type: 'toggle',
      label: 'Readonly',
      default: true,
      bindsClass: 'ui-rating--readonly'
    }
  ],
  tokens: [
    '--ai-rating-star-size',
    '--ai-rating-star-filled-color',
    '--ai-rating-star-empty-color'
  ]
};