module.exports = (eleventyConfig) => {
    //eleventyConfig.setQuietMode(true)
	//eleventyConfig.setTemplateFormats('html,liquid,njk')
	eleventyConfig.addShortcode('11ty_version', () => require('@11ty/eleventy/package.json').version)
	eleventyConfig.addPassthroughCopy({
		'./src/static': './'
	})
}
