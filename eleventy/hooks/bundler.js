const
fs = require('fs'),
path = require('path'),
esbuild = require('esbuild'),
htmlMinifierTerser = require('html-minifier-terser').minify

function minifyTemplateLiteralsPlugin() {
  return {
    name: 'minify-template-literals',
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, async (args) => {
        let contents = await fs.promises.readFile(args.path, 'utf8')

        contents = contents.replace(/`([\s\S]*?)`/g, (match, p1) => {
          if (/\$\{/.test(p1) && !/<[a-z][\s\S]*>/i.test(p1)) return match
          try {
            const min = htmlMinifierTerser(p1, {
              collapseWhitespace: true,
              removeComments: true
            })
            return '`' + min + '`'
          } catch (e) {
            return match
          }
        })

        return { contents, loader: 'js' }
      })
    }
  }
}

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
            'forms.netlify': path.resolve(__dirname, '../../bundler/esbuild/netlifyForms.js')
          },
          ...minifyOption,
          legalComments: isProduction ? 'none' : 'inline',
          plugins: [minifyTemplateLiteralsPlugin()]
        })
        
        let bundle = fs.readFileSync(outputFilePath, 'utf8')
        bundle = bundle.replace(/\s+$/,'')
        fs.writeFileSync(outputFilePath, bundle)
        console.log(`JavaScript bundle created: ${outputFilename}`)
      }
    } catch (error) {
      console.error('Error during JavaScript bundling:', error)
    }
  })
}
