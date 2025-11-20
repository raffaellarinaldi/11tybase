const
fs = require('fs').promises,
path = require('path'),
htmlMinifierTerser = require('html-minifier-terser')

const
isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment',
isServerless = process.env.ELEVENTY_SERVERLESS === 'true',
isLocal = process.env.ELEVENTY_ENV === 'development'

const minifyHTML = async (content, outputPath) => {
  if (outputPath && (outputPath.endsWith('.html') || outputPath.endsWith('.xml')) && (isProduction || (isServerless && !isLocal))) {
    try {
      content = content.trim().replace(/<!--\[if[\s\S]*?<!\[endif\]-->/g, match => match.replace(/\s+/g, ' '))
      return await htmlMinifierTerser.minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true
      })
    } catch (error) {
      console.error(`Error minifying HTML/XML for ${outputPath}:`, error)
    }
  }
  return content
}

const minifyJSON = async (content, outputPath) => {
  if (outputPath && outputPath.endsWith('.json') && (isProduction || (isServerless && !isLocal))) {
    try {
      return JSON.stringify(JSON.parse(content))
    } catch (error) {
      console.error(`Error minifying JSON for ${outputPath}:`, error)
    }
  }
  return content
}

module.exports = {
  minifyHTML,
  minifyJSON
}
