const
fs = require('fs'),
path = require('path'),
esbuild = require('esbuild')

module.exports = function(eleventyConfig, config) {
  const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment'
  const isLocal = process.env.ELEVENTY_ENV === 'development'

  eleventyConfig.on('afterBuild', async () => {
    try {
      const minifyOption = isLocal ? { minify: false } : { minify: true }
      const externalModules = config.externalModules || []

      for (const jsFile of config.jsFiles) {
        const outputFilename = isProduction
          ? `${path.basename(jsFile, '.js')}.min.js`
          : `${path.basename(jsFile, '.js')}.js`

        const inputFilePath = path.resolve(config.inputDir, jsFile)
        if (!fs.existsSync(inputFilePath)) {
          throw new Error(`Input file does not exist: ${inputFilePath}`)
        }

        const outputFilePath = path.resolve(config.outputDir, outputFilename)

        await esbuild.build({
          entryPoints: [inputFilePath],
          bundle: true,
          outfile: outputFilePath,
          sourcemap: !isProduction,
          target: 'es2020',
          external: externalModules,
          alias: {
            languages: path.resolve(process.cwd(), 'src/submodules/base/bundler/esbuild/languages'),
            cookies: path.resolve(process.cwd(), 'src/submodules/base/bundler/esbuild/cookies'),
            iframes: path.resolve(process.cwd(), 'src/submodules/base/bundler/esbuild/iframes'),
            'forms.netlify': path.resolve(process.cwd(), 'src/submodules/base/bundler/esbuild/netlifyForms')
          },
          ...minifyOption
        })

        console.log(`JavaScript bundle created: ${outputFilename}`)
      }
    } catch (error) {
      console.error('Error during JavaScript bundling:', error)
    }
  })
}
