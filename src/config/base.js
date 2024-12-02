module.exports = (eleventyConfig) => {
	eleventyConfig.addShortcode('11ty_version', () => require('@11ty/eleventy/package.json').version)
}
