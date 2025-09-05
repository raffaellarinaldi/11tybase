const
slugify = require('slugify'),
{ sortCollection } = require('./utils')

module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter('limit', (input, start, end, mode = 'entries') => {
    if (!input) return []

    if (Array.isArray(input)) return input.slice(start, end)

    if (typeof input === 'object') {
      const extract = { entries: Object.entries, values: Object.values, keys: Object.keys }[mode] || Object.entries
      return extract(input).slice(start, end)
    }

    return []
  })
  
  eleventyConfig.addFilter('featuredPosts', (collection, featuredCount = 3, sortField = 'date', sortOrder = 'desc') => {
    const featuredItems = collection.filter(item => item.data.featured === true)
    return sortCollection(featuredItems, sortField, sortOrder).slice(0, featuredCount)
  })

  eleventyConfig.addFilter('relatedPosts', (collection = [], currentSlug, limit = 3, sortField = 'date', sortOrder = 'desc') => {
    const currentItem = collection.find(item => item.fileSlug === currentSlug)
    const requiredTags = currentItem?.data?.tags
    if (!requiredTags) return []

    const relatedItems = collection.filter(item => {
      const hasCommonTags = requiredTags.some(tag => item.data.tags?.includes(tag))
      return item.fileSlug !== currentSlug && hasCommonTags
    })

    return sortCollection(relatedItems, sortField, sortOrder).slice(0, limit)
  })
  
  eleventyConfig.addFilter('taxonomyClasses', input => {
    if (!input) return ''
    const arr = Array.isArray(input) ? input : [input]
    return arr.map(t => {
      let slugified = slugify(t, {
        lower: true
      })
      slugified = slugified.replace(/[^a-z0-9-]/g, '-')
      return slugified
    }).join(' ')
  })

  eleventyConfig.addFilter('truncateText', (text, limit) => {
    if (!text || typeof text !== 'string') return ''
    if (text.length > limit) return text.slice(0, limit) + '...'
    return text
  })
  
  eleventyConfig.addFilter('splitParagraphs', (text, paragraphIndexes = []) => {
    const paragraphs = text.split('\n\n').map(paragraph => paragraph.trim())

    if (paragraphIndexes.length > 0) {
      return paragraphIndexes.map(index => paragraphs[index] || null).filter(paragraph => paragraph !== null)
    }

    return paragraphs
  })
  
  eleventyConfig.addFilter('stripParagraphs', (content) => {
    	return content.replace(/<\/?p>/g, '')
	})
	
	eleventyConfig.addFilter('getPost', (posts, fileSlug, lang) => {
    if (!posts || !Array.isArray(posts)) {
      return null
    }
  
    const found = posts.find(post => {
      if (lang) {
        return post.fileSlug === fileSlug && (post.lang || post.data?.lang) === lang
      } else {
        return post.fileSlug === fileSlug
      }
    })
  
    return found || null
  })
  
  eleventyConfig.addFilter('getOriginalPost', (posts, fileSlug, lang) => {
    lang = lang || eleventyConfig.globalData.defaultLang
    return posts.find(post => post.fileSlug === fileSlug && post.lang === lang) || null
  })

  eleventyConfig.addFilter('getAllTermsInTaxonomy', (posts, filterTax, taxonomy = 'categories') => {
    const allTax = []
    posts.forEach(post => {
      const postTax = post.data[taxonomy]?.map(term => term.trim()) || []
      allTax.push(...postTax)
    })
    const uniqueAllTax = [...new Set(allTax)]
    return filterTax.includes('all') ? uniqueAllTax : filterTax.filter(term => uniqueAllTax.includes(term))
  })

  eleventyConfig.addFilter('filterPostsByTaxonomy', (posts, taxonomyType, taxonomy) => {
    return posts.filter(post => post.data[taxonomyType] && post.data[taxonomyType].includes(taxonomy))
  })
  
  eleventyConfig.addFilter('filterPostsForArchive', (posts) => {
    if (!Array.isArray(posts)) return []
    return posts.filter(post => !post.data.eleventyExcludeFromArchive)
  })
  
  eleventyConfig.addFilter('filterPostsByLanguage', (posts, lang) => {
    return !lang ? posts : posts.filter(post => (post.lang || post.data?.lang) === lang)
  })
  
  eleventyConfig.addFilter('excludeDrafts', (collection) => {
    return collection.filter(item => !item.data.draft)
  })
  
  eleventyConfig.addFilter('selectItems', (input, o = {}) => {
    if (!input || typeof input !== 'object') return []
    const { prop, value, negate = false, keys, withKey = false } = o
    const get = (obj, path) => {
      if (obj == null || !path) return undefined
      const parts = Array.isArray(path) ? path : String(path).split('.')
      let cur = obj
      for (const p of parts) {
        if (cur == null) return undefined
        if (Array.isArray(cur) && /^\d+$/.test(p)) cur = cur[Number(p)]
        else cur = cur[p]
      }
      return cur
    }
    let entries
    if (Array.isArray(input)) entries = input.map((v, i) => [i, v])
    else if (input instanceof Map) entries = Array.from(input.entries())
    else if (typeof input === 'object') entries = Object.entries(input)
    else return []
    if (prop) {
      entries = entries.filter(([k, it]) => {
        const val = get(it, prop)
        const hasProp = val !== undefined
        const matches = value === undefined ? hasProp : val === value
        return negate ? !matches : matches
      })
    }
    if (Array.isArray(keys) && keys.length) {
      const map = new Map(entries.map(([k, v]) => [String(k), [k, v]]))
      entries = keys.map(k => map.get(String(k)) || null).filter(Boolean)
    }
    if (withKey) return entries
    return entries.map(([k, v]) => v)
  })
  
  eleventyConfig.addFilter('getAdjacentPostsByLanguage', (posts, currentUrl, lang) => {
    let previousPost = null, nextPost = null

    for (let i = 0; i < posts.length; i++) {
      if (posts[i].url === currentUrl && posts[i].lang === lang) {
        previousPost = posts.slice(0, i).reverse().find(post => post.lang === lang) || null
        nextPost = posts.slice(i + 1).find(post => post.lang === lang) || null
        break
      }
    }

    return { previousPost, nextPost }
  })
  
  eleventyConfig.addFilter('renderFlatMenu', function (
    links = [],
    ulClass = '',
    liClass = '',
    aClass = ''
  ) {
    const renderDataAttrs = data => Object.entries(data || {}).map(([k, v]) => `data-${k}="${v}"`).join(' ')
  
    const renderedLinks = links.map(({ href = '#', label = 'Link', target = '', title = '', rel = '', data = {} }) => {
      const attrs = [
        `href="${href}"`,
        aClass && `class="${aClass}"`,
        target && `target="${target}"`,
        rel && `rel="${rel}"`,
        title && `title="${title}"`,
        renderDataAttrs(data)
      ].filter(Boolean).join(' ')
      return `<li class="${liClass}"><a ${attrs}>${label}</a></li>`
    }).join('\n')
  
    return `<ul class="${ulClass}">\n${renderedLinks}\n</ul>`
  })
}
