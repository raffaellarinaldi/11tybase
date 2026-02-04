const languages = require('./languages')

module.exports = (eleventyConfig) => {
    const env = process.env.ELEVENTY_ENV || 'development'
    eleventyConfig.addGlobalData('eleventy', { environment: env })
    eleventyConfig.addGlobalData('eleventyComputed', {
        permalink: (data) => data.draft && env !== 'development' ? false : data.permalink,
        eleventyExcludeFromCollections: (data) =>
            data.eleventyExcludeFromCollections === true ? true :
            data.draft && env !== 'development'
    })
    eleventyConfig.addGlobalData('languages', languages)
}
