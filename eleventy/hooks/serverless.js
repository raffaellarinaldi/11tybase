const { EleventyServerlessBundlerPlugin } = require('@11ty/eleventy')

module.exports = (eleventyConfig) => {
	eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
		name: 'onrequest',
		functionsDir: './netlify/functions/',
		copy: [
			{ from: '.cache', to: 'cache' }
		]
	})
}
