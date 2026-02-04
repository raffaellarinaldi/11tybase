const
fs = require('fs'),
path = require('path'),
slugify = require('slugify'),
{ sortCollection } = require('./utils')

module.exports = (eleventyConfig, options = {}) => {
  const dirsInput = options.input || 'src'
  
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
  
  eleventyConfig.addFilter('taxonomyClasses', (input, lang) => {
    if (!input) return ''
    let terms = input
    if (typeof input === 'object' && !Array.isArray(input)) {
      terms = input[lang] || []
    }
    const arr = Array.isArray(terms) ? terms : [terms]
    return arr.map(t => {
      const termString = typeof t === 'string' ? t : String(t)
      let slugified = slugify(termString, {
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
	
	eleventyConfig.addFilter('lowerFirst', (str) => {
    if (typeof str !== 'string' || str.length === 0) {
      return str
    }
    const firstChar = str.charAt(0).toLowerCase()
    const restOfString = str.slice(1)
    return firstChar + restOfString
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
  
  eleventyConfig.addFilter('getAllTermsInTaxonomy', (posts = [], filterTax = [], taxonomy = 'categories', lang = 'en', dataKey = 'data') => {
    const getNestedValue = (obj, path) => {
      if (!obj || !path) return undefined
      const keys = path.split('.')
      return keys.reduce((currentObj, key) => {
        if (currentObj && typeof currentObj === 'object' && currentObj !== null) {
          return currentObj[key]
        }
        return undefined
      }, obj)
    }
    const allTax = []
    const effectivePosts = Array.isArray(posts) ? posts : []
    const effectiveFilterTax = Array.isArray(filterTax) ? filterTax : []
    effectivePosts.forEach(post => {
      let sourceData = post
      if (dataKey && post[dataKey]) {
        sourceData = post[dataKey]
      }
      let postTaxTerms = getNestedValue(sourceData, taxonomy)
      if (postTaxTerms && typeof postTaxTerms === 'object' && !Array.isArray(postTaxTerms)) {
        postTaxTerms = postTaxTerms[lang] || []
      }
      const postTax = Array.isArray(postTaxTerms)
        ? postTaxTerms.map(term => (typeof term === 'string') ? term.trim() : term)
        : []
      allTax.push(...postTax)
    })
    const uniqueAllTax = [...new Set(allTax)]
    return effectiveFilterTax.includes('all') 
    ? uniqueAllTax 
    : effectiveFilterTax.filter(term => uniqueAllTax.includes(term))
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
  
  eleventyConfig.addFilter('fileExists', webPath => {
    if (!webPath) return false
    const relativePath = webPath.replace(/^\/+/, '')
    const fullPath = path.join(process.cwd(), dirsInput, 'static', relativePath)
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()
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
  
  eleventyConfig.addFilter('getSkillMatchingPercentage', (skills, skillName) => {
    if (!Array.isArray(skills) || !skillName) return null
    if (typeof skillName === 'string') {
      const matchingSkill = skills.find(skill => skill.name === skillName)
      return matchingSkill ? matchingSkill.value : null
    }
    if (Array.isArray(skillName)) {
      const values = skillName.map(name => {
        const found = skills.find(skill => skill.name === name)
        return found ? found.value : 0
      })
      if (!values.length) return null
      const total = values.reduce((a, b) => a + b, 0)
      return Math.round(total / values.length)
    }
    return null
  })
  
  eleventyConfig.addFilter('getExperienceLevel', (value, levels) => {
    if (!Array.isArray(levels) || levels.length === 0) return ''
    const thresholds = [85, 65, 40, 15, 0]
    for (let i = 0; i < thresholds.length; i++) {
      if (value >= thresholds[i]) return levels[i] || ''
    }
    return ''
  })
  
  eleventyConfig.addFilter('getExperienceYears', (itemNames, skillsData, yearsStrings, mode = 'avg') => {
    if (!Array.isArray(itemNames) || !Array.isArray(skillsData) || yearsStrings.length < 3) return ''
    const [yearSingular, yearPlural, lessThan] = yearsStrings
    const currentYear = new Date().getFullYear()
    const years = skillsData
    .filter(skill => itemNames.includes(skill.name))
    .map(skill => {
      const fromYear = parseInt(skill.from)
      if (isNaN(fromYear)) return 0
      const toYear = skill.to ? parseInt(skill.to) : currentYear
      if (fromYear > currentYear) return 0
      return toYear - fromYear
    })
    if (years.length === 0) return ''
    let resultYear = 0
    if (years.length === 1 || mode === 'max') {
      resultYear = Math.max(...years)
    } else if (mode === 'min') {
      resultYear = Math.min(...years)
    } else if (mode === 'avg') {
      const total = years.reduce((sum, current) => sum + current, 0)
      resultYear = Math.round(total / years.length)
    } else {
      resultYear = Math.max(...years)
    }
    if (resultYear <= 0) {
      return `${lessThan} 1 ${yearSingular}`
    } else if (resultYear === 1) {
      return `1 ${yearSingular}`
    } else {
      return `${resultYear} ${yearPlural}`
    }
  })
  
  eleventyConfig.addFilter('calculateStars', value => {
    const totalStars = 5
    let stars = (value / 100) * totalStars
    const fullStars = Math.floor(stars)
    let halfStar = 0
    const decimal = stars - fullStars
    if (decimal >= 0.25 && decimal < 0.75) halfStar = 1
    else if (decimal >= 0.75) stars = fullStars + 1
    let html = ''
    for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>'
    if (halfStar) html += '<i class="fas fa-star-half"></i>'
    return html
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

const createNavFilter = (rules) => (items, main) => {
  if (!main) {
    console.error("Error in filterNavByContent: Could not find 'main' data object")
    return []
  }
  return items.filter(item => {
    const rule = rules[item.href]
    if (rule) {
      return rule(main)
    }
    return true
  })
}

module.exports.createNavFilter = createNavFilter
