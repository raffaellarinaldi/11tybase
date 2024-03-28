module.exports = (eleventyConfig) => {
	return {
		passthroughFileCopy: true,
		dir: {
			input: 'src',
			output: 'dist',
			data: 'data',
			includes: 'includes',
			layouts: 'layouts'
		}
	}
}
