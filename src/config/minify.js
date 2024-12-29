const
fs = require('fs').promises,
path = require('path'),
htmlMinifierTerser = require('html-minifier-terser'),
{ minify: jsmin } = require('terser')

const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment' || process.env.ELEVENTY_SERVERLESS === 'true'

function getJsPath(basePath = 'assets/js', fileName = 'scripts') {
  return isProduction ? `${basePath}/${fileName}.min.js` : `${basePath}/${fileName}.js`
}

module.exports = {
  configFunction: (eleventyConfig, options = {}) => {
    const dirs = options.dirs
    const baseJsPath = options.baseJsPath || 'assets/js'
    const jsFileName = options.jsFileName || 'scripts'

    eleventyConfig.addTransform('minifyHTML', async (content, outputPath) => {
      if (outputPath && outputPath.endsWith('.html') && isProduction) {
        try {
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
          console.error(`Error minifying HTML for ${outputPath}:`, error)
        }
      }
      return content
    })

    eleventyConfig.on('beforeBuild', async () => {
      await module.exports.processJavaScript(dirs, baseJsPath, jsFileName)
    })
  },

  processJavaScript: async (dirs, baseJsPath = 'assets/js', jsFileName = 'scripts') => {
    const inputFolderPath = path.join(dirs.input, baseJsPath)
    const outputFolderPath = path.join(dirs.output, baseJsPath)

    try {
      const files = await fs.readdir(inputFolderPath)
      const jsFiles = files.filter(file => file.endsWith('.js') && file.startsWith(jsFileName))

      if (jsFiles.length === 0) {
        console.warn(`No JavaScript files found in ${inputFolderPath} matching ${jsFileName}.`)
      }

      for (const jsFile of jsFiles) {
        const inputFilePath = path.join(inputFolderPath, jsFile)
        const outputFileName = isProduction ? jsFile.replace('.js', '.min.js') : jsFile
        const outputFilePath = path.join(outputFolderPath, outputFileName)

        const content = await fs.readFile(inputFilePath, 'utf8')
        await fs.mkdir(outputFolderPath, { recursive: true })

        const processedContent = isProduction ? (await jsmin(content)).code : content
        await fs.writeFile(outputFilePath, processedContent)
        console.log(`Processed JS file: ${outputFilePath}`)
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Warning: the folder ${inputFolderPath} does not exist. Continuing without processing.`)
      } else {
        console.error(`Error processing JavaScript in ${inputFolderPath}:`, error)
      }
    }
  }
}
