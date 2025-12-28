const
fs = require('fs').promises,
path = require('path'),
posthtml = require('posthtml'),
htmlMinifier = require('html-minifier-terser')

const
isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment',
isServerless = process.env.ELEVENTY_SERVERLESS === 'true',
isLocal = process.env.ELEVENTY_ENV === 'development'

const cleanAttrsPlugin = (tree) => {
  tree.walk(node => {
    if (node.attrs) {
      for (const attr in node.attrs) {
        if (typeof node.attrs[attr] === 'string') {
          node.attrs[attr] = node.attrs[attr].split(/\s+/).join(' ').trim()
        }
      }
    }
    return node
  })
}

const minifyHTML = async (content, outputPath) => {
  if (outputPath && (outputPath.endsWith('.html') || outputPath.endsWith('.xml')) && (isProduction || (isServerless && !isLocal))) {
    try {
      const cleaned = await posthtml([cleanAttrsPlugin]).process(content)
      return await htmlMinifier.minify(cleaned.html, {
        collapseWhitespace: true,
        removeComments: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        processConditionalComments: true
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
