const
fs = require('fs'),
path = require('path'),
cleanCss = require('clean-css'),
eleventySass = require('eleventy-sass')

const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment'

module.exports = (eleventyConfig, dirs) => {
  eleventyConfig.addPlugin(eleventySass, [{
    sass: { style: 'expanded', sourceMap: false },
    rev: true,
    when: [{ ELEVENTY_ENV: 'production' }, { ELEVENTY_ENV: 'deployment' }]
  }])

  eleventyConfig.on('afterBuild', () => {
    if (!isProduction) return

    const outputPath = path.join(dirs.output, 'assets/css')
    if (!fs.existsSync(outputPath)) return console.warn(`CSS directory not found: ${outputPath}`)

    const cssFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.css') && !f.endsWith('.min.css'))
    if (!cssFiles.length) return console.warn(`No CSS files to process in ${outputPath}`)

    for (const file of cssFiles) {
      const filePath = path.join(outputPath, file)
      const minFilePath = path.join(outputPath, file.replace('.css', '.min.css'))
      const css = fs.readFileSync(filePath, 'utf8')

      const minified = new cleanCss({
        level: {
          1: { specialComments: 0 },
          2: true
        },
        format: false,
        inline: false,
        compatibility: '*',
        rebase: false
      }).minify(css).styles

      fs.writeFileSync(minFilePath, minified)
      fs.unlinkSync(filePath)

      console.log(`CSS minified and all comments removed: ${minFilePath}`)
    }
  })
}
