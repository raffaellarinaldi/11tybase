const
fs = require('fs'),
path = require('path'),
esbuild = require('esbuild'),
{ minify: terserMinify } = require('terser')

module.exports = function(eleventyConfig, config) {
  const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment'
  const isLocal = process.env.ELEVENTY_ENV === 'development'

  eleventyConfig.on('afterBuild', async () => {
    try {
      const externalModules = config.externalModules || []

      for (const jsFile of config.jsFiles) {
        const outputFilename = isProduction
          ? `${path.basename(jsFile, '.js')}.min.js`
          : `${path.basename(jsFile, '.js')}.js`

        const inputFilePath = path.resolve(config.inputDir, jsFile)
        if (!fs.existsSync(inputFilePath)) throw new Error(`Input file does not exist: ${inputFilePath}`)

        const outputFilePath = path.resolve(config.outputDir, outputFilename)

        await esbuild.build({
          entryPoints: [inputFilePath],
          bundle: true,
          outfile: outputFilePath,
          sourcemap: !isProduction,
          target: 'es2020',
          external: externalModules,
          alias: {
            languages: path.resolve(__dirname, '../../bundler/esbuild/languages.js'),
            cookies: path.resolve(__dirname, '../../bundler/esbuild/cookies.js'),
            iframes: path.resolve(__dirname, '../../bundler/esbuild/iframes.js'),
            forms: path.resolve(__dirname, '../../bundler/esbuild/forms.js')
          },
          minify: false,
          legalComments: isProduction ? 'none' : 'inline'
        })

        if (isProduction) {
          const bundle = fs.readFileSync(outputFilePath, 'utf8')
          const minified = await terserMinify(bundle, {
            format: {
              ascii_only: true,
              beautify: false,
              comments: false
            },
            compress: {
              ecma: 2020,
              passes: 2
            }
          })
          fs.writeFileSync(outputFilePath, minified.code)
        }
        console.log(`JavaScript bundle created: ${outputFilename}`)
      }
    } catch (error) {
      console.error('Error during JavaScript bundling:', error)
    }
  })
}
