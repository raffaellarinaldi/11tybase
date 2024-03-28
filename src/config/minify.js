const htmlmin = require('html-minifier').minify

module.exports = eleventyConfig => {
  eleventyConfig.addTransform('minifyHTML', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html') && process.env.ELEVENTY_ENV !== 'development') {
      return htmlmin(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        useShortDoctype: true,
        minifyJS: true
      })
    }
    return content
  })
}
