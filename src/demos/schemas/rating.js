export default {
  component: 'rating',
  atomicLevel: 'molecule',
  baseClass: 'ui-rating',
  template: `<div class="{class}" role="img" aria-label="4 out of 5 stars">
    <button type="button" class="ui-rating__star ui-rating__star--filled" aria-label="1 star">★</button>
    <button type="button" class="ui-rating__star ui-rating__star--filled" aria-label="2 stars">★</button>
    <button type="button" class="ui-rating__star ui-rating__star--filled" aria-label="3 stars">★</button>
    <button type="button" class="ui-rating__star ui-rating__star--filled" aria-label="4 stars">★</button>
    <button type="button" class="ui-rating__star" aria-label="5 stars">★</button>
    <span class="ui-rating__count">(128)</span>
  </div>`,
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