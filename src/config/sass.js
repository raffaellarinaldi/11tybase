const
fs = require('fs-extra'),
sass = require('sass')

module.exports = (eleventyConfig, options = {}) => {
    eleventyConfig.on('eleventy.before', () => {
        const defaultOptions = {
            fileName: 'styles.min',
            outputPath: eleventyConfig.dir.output ? eleventyConfig.dir.output + '/assets/css/' : 'dist/assets/css/',
            inputPath: eleventyConfig.dir.input ? eleventyConfig.dir.input + '/assets/css/' : 'src/assets/css/'
        }
        const mergedOptions = { ...defaultOptions, ...options }
        const isDev = process.env.ELEVENTY_ENV === 'development'
        let style = sass.renderSync({
            file: mergedOptions.inputPath + mergedOptions.fileName + '.scss',
            sourceMap: false,
            outputStyle: isDev ? 'expanded' : 'compressed'
        })
        if (!fs.existsSync(mergedOptions.outputPath)) {
            fs.ensureDirSync(mergedOptions.outputPath)
        }
        fs.writeFile(mergedOptions.outputPath + mergedOptions.fileName + '.css', style.css, (err) => {
            if (err) throw err
            console.log('CSS generated')
        })
    })
    //eleventyConfig.addWatchTarget(eleventyConfig.dir.input + '/assets/')
}
