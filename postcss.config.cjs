const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-nesting'),
    require('autoprefixer'),
    ...(isProd ? [require('cssnano')({ preset: 'default' })] : [])
  ]
}
