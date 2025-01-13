const
fs = require('fs'),
path = require('path'),
eleventySass = require('eleventy-sass')

const isProduction = process.env.ELEVENTY_ENV === 'production' || process.env.ELEVENTY_ENV === 'deployment'

module.exports = (eleventyConfig, dirs) => {
  eleventyConfig.addPlugin(eleventySass, [{
    sass: { style: isProduction ? 'compressed' : 'expanded', sourceMap: false },
    rev: true,
    when: [{ ELEVENTY_ENV: 'production' }, { ELEVENTY_ENV: 'deployment' }]
  }])

  eleventyConfig.on('afterBuild', () => {
    if (isProduction) {
      const outputPath = path.join(dirs.output, 'assets/css')

      try {
        const cssFiles = fs.readdirSync(outputPath).filter(file => 
          file.endsWith('.css') && !file.endsWith('.min.css')
        )

        if (cssFiles.length === 0) {
          console.warn(`No CSS files found in ${outputPath}`)
          return
        }

        cssFiles.forEach(file => {
          const originalFilePath = path.join(outputPath, file)
          const minifiedFilePath = path.join(outputPath, file.replace('.css', '.min.css'))

          fs.renameSync(originalFilePath, minifiedFilePath)
          console.log(`CSS file renamed to: ${minifiedFilePath}.`)
        })
      } catch (error) {
        console.error(`Error renaming CSS files in ${outputPath}:`, error)
      }
    }
  })
}
