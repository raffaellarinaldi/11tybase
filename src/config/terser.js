const
fs = require('fs').promises,
path = require('path'),
htmlMinifierTerser = require('html-minifier-terser'),
{ minify: jsmin } = require('terser')

const
isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment',
isServerless = process.env.ELEVENTY_SERVERLESS === 'true',
isLocal = process.env.ELEVENTY_ENV === 'development'

const minifyHTML = async (content, outputPath) => {
  if (outputPath && outputPath.endsWith('.html') && (isProduction || (isServerless && !isLocal))) {
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
}

const minifyJS = async (content) => {
  if (isProduction || (isServerless && !isLocal)) {
    try {
      return (await jsmin(content)).code
    } catch (error) {
      console.error('Error minifying JS:', error)
    }
  }
  return content
}

const combineJS = async (dirs) => {
  const inputFolderPath = path.join(dirs.input, 'assets/js')
  const outputFolderPath = path.join(dirs.output, 'assets/js')

  try {
    const files = await fs.readdir(inputFolderPath)

    const modulesPath = path.join(inputFolderPath, 'modules')
    const modulesExist = await fs.stat(modulesPath).catch(() => false)

    if (modulesExist) {
      const jsFiles = await fs.readdir(modulesPath)

      if (jsFiles.length > 0) {
        const content = await Promise.all(
          jsFiles.map(async (file) => {
            const filePath = path.join(modulesPath, file)
            const fileContent = await fs.readFile(filePath, 'utf8')
            return fileContent
          })
        )

        const finalContent = content.join('\n')
        const outputFileName = isProduction ? `scripts.min.js` : `scripts.js`
        const outputFilePath = path.join(outputFolderPath, outputFileName)

        await fs.mkdir(outputFolderPath, { recursive: true })

        const processedContent = await minifyJS(finalContent)
        await fs.writeFile(outputFilePath, processedContent)
      }
    }

    const moduleDirs = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(inputFolderPath, file)
        const stats = await fs.stat(filePath)
        if (stats.isDirectory()) {
          const subModulesPath = path.join(filePath, 'modules')
          const subModulesExist = await fs.stat(subModulesPath).catch(() => false)
          if (subModulesExist) return file
        }
        return null
      })
    ).then(results => results.filter(Boolean))

    if (moduleDirs.length > 0) {
      for (const dir of moduleDirs) {
        const modulePath = path.join(inputFolderPath, dir, 'modules')
        const jsFiles = await fs.readdir(modulePath)

        if (jsFiles.length > 0) {
          const content = await Promise.all(
            jsFiles.map(async (file) => {
              const filePath = path.join(modulePath, file)
              const fileContent = await fs.readFile(filePath, 'utf8')
              return fileContent
            })
          )

          const finalContent = content.join('\n')
          const outputFileName = isProduction ? `scripts.${dir}.min.js` : `scripts.${dir}.js`
          const outputFilePath = path.join(outputFolderPath, outputFileName)

          await fs.mkdir(outputFolderPath, { recursive: true })

          const processedContent = await minifyJS(finalContent)
          await fs.writeFile(outputFilePath, processedContent)
        }
      }
    } else if (!modulesExist) {
      console.warn(`No JavaScript files found in ${inputFolderPath}`)
    }
  } catch (error) {
    console.error('Error combining JavaScript files:', error)
  }
}

module.exports = {
  minifyHTML,
  minifyJS,
  combineJS
}
