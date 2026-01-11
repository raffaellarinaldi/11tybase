const
fs = require('fs'),
path = require('path'),
image = require('@11ty/eleventy-img')

module.exports = (eleventyConfig, options) => {
  const widths = Array.isArray(options.width) ? options.width : [1200]
  const heights = Array.isArray(options.height) ? options.height : [465]
  const fit = options.fit || 'crop'
  const outputDir = options.outputDir
  const stockDir = path.join(outputDir, 'assets', 'img', options.stockDir || 'blog')
  const assetPath = stockDir.replace(outputDir, '')

  if (!outputDir) {
    console.error('Error: No output directory specified.')
    return
  }

  if (!fs.existsSync(stockDir)) {
    fs.mkdirSync(stockDir, { recursive: true })
  }

  const generateUnsplashUrl = (unsplashId, width, height, fit) => {
    return `https://images.unsplash.com/photo-${unsplashId}?w=${width}&h=${height}&fit=${fit}`
  }

  const downloadImage = async (url, unsplashId, width, height) => {
    try {
      const fileName = `${unsplashId}-${width}x${height}.jpg`
      const imagePath = path.join(stockDir, fileName)

      await image(url, {
        widths: [width],
        height,
        formats: ['jpeg'],
        outputDir: stockDir,
        filenameFormat: () => fileName,
        fit: fit
      })

      return { width, height, url: `${assetPath}/${fileName}` }
    } catch (error) {
      console.error('Error processing image:', error)
      return null
    }
  }

  eleventyConfig.addCollection('unsplash', async (collectionApi) => {
    const allItems = collectionApi.getAll() || []
    if (allItems.length === 0) {
      return []
    }

    const unsplashCollection = []
    const unsplashMap = {}

    for (const item of allItems) {
      if (item.data && item.data.unsplash) {
        const unsplashId = item.data.unsplash

        if (!unsplashMap[unsplashId]) {
          unsplashMap[unsplashId] = {
            unsplash: unsplashId,
            files: []
          }
        }

        for (let i = 0; i < widths.length; i++) {
          const width = widths[i]
          const height = heights[i] || heights[0]

          const imageUrl = generateUnsplashUrl(unsplashId, width, height, fit)
          const processedImage = await downloadImage(imageUrl, unsplashId, width, height)

          if (processedImage) {
            unsplashMap[unsplashId].files.push(processedImage)
          }
        }
      }
    }

    for (const unsplashId in unsplashMap) {
      unsplashCollection.push(unsplashMap[unsplashId])
    }

    return unsplashCollection
  })
}
