const
fs = require('fs'),
path = require('path'),
glob = require('glob-promise'),
lodash = require('lodash'),
slugify = require('slugify'),
matter = require('gray-matter'),
deepmerge = require('deepmerge'),
languages = require('./languages'),
{ sortCollection } = require('./utils')

const getCollectionPath = (dirs, lang, collection) => {
  const basePath = lang 
    ? dirs.collections ? `${dirs.input}/${lang}/${dirs.collections}` : `${dirs.input}/${lang}`
    : dirs.collections ? `${dirs.input}/${dirs.collections}` : dirs.input

  return `${basePath}/${collection}`
}

const defaultCollectionFormat = 'md'
const getCollectionGlobPathWithExt = (dirs, lang, collection, fileExt = defaultCollectionFormat) => {
  return `${getCollectionPath(dirs, lang, collection)}/*.${fileExt}`
}

const sortConfig = {
  posts: { sortBy: 'date', sortOrder: 'desc' },
  projects: { sortBy: 'title', sortOrder: 'asc' }
}

const getFrontMatterData = async (item) => {
  if (item.template?.read) {
    const data = await item.template.read().catch(() => {})
    return data?.data || {}
  }
  return item.data
}

const getPaginatorSlugByLang = (lang) => languages[lang]?.pagination.slug || 'page'

const groupItemsByTaxonomyBase = async (siteLangs = null, allItems, taxonomy, taxonomyArray, itemsPerPage, paginatorSlugArray, sortBy, sortOrder) => {
  let collectionTaxonomies = [...new Set(allItems.flatMap(item => item.data[taxonomy] || []))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  let collectionByTaxonomy = []

  for (const taxonomyValue of collectionTaxonomies) {
    let langIndexes = siteLangs ? siteLangs.map((_, i) => i) : [null]

    for (let langIndex of langIndexes) {
      const currentLang = siteLangs ? siteLangs[langIndex] : null
      const taxonomySingular = siteLangs ? taxonomyArray[langIndex] : taxonomyArray
      const paginatorSlug = siteLangs ? paginatorSlugArray[langIndex] : paginatorSlugArray
      
      let itemsInTaxonomy = allItems.filter(item =>
        (!currentLang || item.lang === currentLang) && (item.data[taxonomy] || []).includes(taxonomyValue)
      )

      if (itemsInTaxonomy.length === 0) continue

      itemsInTaxonomy = await Promise.all(itemsInTaxonomy.map(async item => ({
        url: item.url,
        lang: item.lang,
        fileSlug: item.fileSlug,
        filePath: item.filePath,
        data: await getFrontMatterData(item)
      })))

      itemsInTaxonomy = sortCollection(itemsInTaxonomy, sortBy, sortOrder)
      let chunkedItems = itemsPerPage === -1 ? [itemsInTaxonomy] : lodash.chunk(itemsInTaxonomy, itemsPerPage)
      let taxonomySlug = slugify(taxonomyValue, { lower: true, strict: true })
      let taxonomySingularSlug = slugify(taxonomySingular, { lower: true, strict: true })

      let pagesSlugs = chunkedItems.map((_, i) =>
        i === 0 ? `/${taxonomySingularSlug}/${taxonomySlug}/` : `/${taxonomySingularSlug}/${taxonomySlug}/${paginatorSlug}/${i + 1}/`
      )

      chunkedItems.forEach((items, index) => {
        collectionByTaxonomy.push({
          title: taxonomyValue,
          slug: taxonomySlug,
          lang: currentLang,
          pageNumber: index,
          url: pagesSlugs[index],
          taxonomySingular,
          totalPages: pagesSlugs.length,
          pageSlugs: {
            all: pagesSlugs,
            next: pagesSlugs[index + 1] || null,
            previous: pagesSlugs[index - 1] || null,
            first: pagesSlugs[0],
            last: pagesSlugs[pagesSlugs.length - 1]
          },
          items
        })
      })
    }
  }
  return collectionByTaxonomy
}

const groupItemsByTaxonomy = async (allItems, taxonomy, taxonomySingular, itemsPerPage, paginatorSlug, sortBy, sortOrder) => {
  return groupItemsByTaxonomyBase(null, allItems, taxonomy, taxonomySingular, itemsPerPage, paginatorSlug, sortBy, sortOrder)
}

const groupMultilingualItemsByTaxonomy = async (siteLangs, allItems, taxonomy, taxonomySingular, itemsPerPage, paginatorSlug, sortBy, sortOrder) => {
  return groupItemsByTaxonomyBase(siteLangs, allItems, taxonomy, taxonomySingular, itemsPerPage, paginatorSlug, sortBy, sortOrder)
}

const addCollectionFromModel = (collectionApi, dirs, collectionName, collectionModel, fileExt) => {
  const collectionPath = getCollectionGlobPathWithExt(dirs, '', collectionName, fileExt)

  let collection = collectionApi.getFilteredByGlob(collectionPath)
  collection = collection.filter(item => !item.data.eleventyExcludeFromCollections)

  const sortOpts = sortConfig[collectionModel] || {}
  collection = sortCollection(collection, sortOpts.sortBy, sortOpts.sortOrder)

  return collection
}

const addTaxonomyCollection = async (collectionApi, dirs, collectionNames = 'all', taxonomy, fileExt, sortOrder = 'asc') => {
  let items = collectionNames === 'all' 
    ? await collectionApi.getAll() 
    : (await Promise.all(collectionNames.map(collection => 
        collectionApi.getFilteredByGlob(getCollectionGlobPathWithExt(dirs, '', collection, fileExt))
      ))).flat()

  let taxonomySet = new Set()
  items.forEach(item => item.data[taxonomy]?.forEach(value => taxonomySet.add(value)))

  return sortCollection([...taxonomySet].map(value => ({ data: { title: value } })), 'title', sortOrder)
    .map(item => item.data.title)
}

const addCollectionByTaxonomy = async (collectionApi, dirs, collectionNames = 'all', taxonomy, taxonomySingular, itemsPerPage, paginatorSlug = null, fileExt, sortBy, sortOrder) => {
  const firstCollection = Array.isArray(collectionNames) ? collectionNames[0] : collectionNames
  const sortOpts = sortConfig[firstCollection] || {}
  sortBy = sortBy ?? sortOpts.sortBy
  sortOrder = sortOrder ?? sortOpts.sortOrder
  const lang = collectionApi?.ctx?.globals?.lang || Object.keys(languages)[0]
  const effectivePaginatorSlug = paginatorSlug || languages[lang]?.pagination?.slug

  let allItems = collectionNames === 'all'
    ? await collectionApi.getAll()
    : (await Promise.all(
        collectionNames.map(collection =>
          collectionApi.getFilteredByGlob(getCollectionGlobPathWithExt(dirs, '', collection, fileExt))
        )
      )).flat()
  
  return groupItemsByTaxonomy(allItems, taxonomy, taxonomySingular, itemsPerPage, effectivePaginatorSlug, sortBy, sortOrder)
}

const addMultilingualCollection = async (collectionApi, dirs, siteLangs, defaultLang, collectionName, fileExt = defaultCollectionFormat, sortBy, sortOrder) => {
  const sortOpts = { sortBy: sortBy ?? sortConfig[collectionName]?.sortBy, sortOrder: sortOrder ?? sortConfig[collectionName]?.sortOrder }

  const addItem = (url, lang, fileSlug, filePath, data) => ({ url, lang, fileSlug, filePath, data })
  
  const cache = {
    collectionData: {}
  }

  const getMissingFields = (defaultData, translatedData) =>
    Object.fromEntries(Object.entries(defaultData).filter(([k]) => !translatedData[k]))

  const dedupe = (val) => Array.isArray(val) ? [...new Set(val)] : val

  const getPermalink = (config, item, data) => {
    let permalink = item.data.permalink

    if (typeof permalink === 'function') {
      try {
        permalink = permalink({ page: { fileSlug: item.fileSlug }, ...data })
        if (typeof permalink === 'function') permalink = ''
      } catch {
        permalink = null
      }
    }

    if (!permalink || typeof permalink !== 'string' || !permalink.startsWith('/')) {
      permalink = `/${item.lang}/${item.fileSlug}/`
    }

    return permalink
  }

  const loadCollectionConfig = (dirs, lang, collectionName) => {
    const cacheKey = `${lang || 'default'}-${collectionName}`
    
    if (cache.collectionData[cacheKey]) {
      return cache.collectionData[cacheKey]
    }

    const collectionConfigPath = path.resolve(getCollectionPath(dirs, lang, collectionName), `${collectionName}.11tydata.mjs`)

    if (fs.existsSync(collectionConfigPath)) {
      if (process.env.NODE_ENV === 'development') {
        delete require.cache[require.resolve(collectionConfigPath)]
      }

      const collectionConfig = require(collectionConfigPath)
      cache.collectionData[cacheKey] = collectionConfig
      return collectionConfig
    }

    return null
  }

  const collectionItems = {}

  await Promise.all(siteLangs.map(async (lang) => {
    const collectionConfig = loadCollectionConfig(dirs, lang, collectionName)
    if (!collectionConfig) return

    const collectionPath = getCollectionGlobPathWithExt(dirs, lang, collectionName, fileExt)
    const collection = collectionApi.getFilteredByGlob(collectionPath)
    
    const formattedCollection = await Promise.all(
      collection
        .filter(item => !item.data.eleventyExcludeFromCollections)
        .map(async (item) => {
          const frontMatterData = await getFrontMatterData(item)
          const url = getPermalink(collectionConfig, item, frontMatterData)
        return addItem(url, lang, item.fileSlug, item.inputPath, frontMatterData)
        }
      )
    )

    formattedCollection.forEach(item => {
      collectionItems[item.fileSlug] = collectionItems[item.fileSlug] || {}
      collectionItems[item.fileSlug][lang] = item
    })
  }))

  await Promise.all(Object.values(collectionItems).flatMap(versions =>
    Object.entries(versions).map(async ([lang, item]) => {
      const defaultData = versions[defaultLang]?.data || {}
      item.originalData = getMissingFields(defaultData, item.data || {})
      item.collectionConfig = loadCollectionConfig(dirs, item.lang, collectionName) || {}

      item.data = Object.fromEntries(Object.entries(item.data).map(([k, v]) => [k, dedupe(v)]))
    })
  ))

  const finalCollection = lodash.flatMap(collectionItems, (versions, fileSlug) =>
    siteLangs.map(lang => {
      const baseData = versions[defaultLang]?.data || {}
      const currentData = versions[lang]?.data || {}
      if (!versions[lang]) return null

      const mergedData = deepmerge(
        baseData,
        currentData,
        {
          arrayMerge: (original, translated) => translated,
          isMergeableObject: (value) => lodash.isPlainObject(value)
        }
      )

      return addItem(versions[lang].url, lang, fileSlug, versions[lang].filePath, mergedData)
    }).filter(Boolean)
  )

  return sortCollection(finalCollection, sortOpts.sortBy, sortOpts.sortOrder)
}

const addMultilingualCollectionByTaxonomy = async (collectionApi, dirs, siteLangs, defaultLang, collectionNames, taxonomy, taxonomyArray, itemsPerPage, paginatorSlugArray, fileExt, sortBy, sortOrder) => {
  const firstCollection = Array.isArray(collectionNames) ? collectionNames[0] : collectionNames
  const sortOpts = sortConfig[firstCollection] || {}
  sortBy = sortBy ?? sortOpts.sortBy
  sortOrder = sortOrder ?? sortOpts.sortOrder

  const paginatorSlugMap = siteLangs.map((lang, index) => paginatorSlugArray?.[index] || getPaginatorSlugByLang(lang))  

  let multilingualItems = (await Promise.all(
    collectionNames.map(collection => addMultilingualCollection(collectionApi, dirs, siteLangs, defaultLang, collection, fileExt, sortBy, sortOrder))
  )).flat()

  return groupMultilingualItemsByTaxonomy(siteLangs, multilingualItems, taxonomy, taxonomyArray, itemsPerPage, paginatorSlugMap, sortBy, sortOrder)  
}

const addCollectionFromFileList = async (collectionApi, dirs, collectionName, folderPath, fileExt) => {
  const basePath = path.join(dirs.input, 'static')
  let files = await glob(path.join(folderPath, `*.${fileExt}`))

  return files.map(file => {
    let pathFilename = file.replace(basePath, '')
    let description = path.basename(pathFilename)
      .replace(/^\d*-/, '')
      .replace(new RegExp(`.${fileExt}$`), '')
      .replace(/-/g, ' ')
      .replace(/(^\w{1})|(\s+\w{1})/g, firstLetter => firstLetter.toUpperCase())
    
    return { pathFilename, description }
  })
}

const addNavigationMenuByLang = (collectionApi, dirs, siteLangs, defaultLang) => (lang) =>
  collectionApi.getAll().filter(item => {
    if (!item.data.eleventyNavigation) return false
    item.data.eleventyNavigation.lang = item.data.lang || defaultLang || languages[0]
    return item.data.eleventyNavigation.lang === lang
  })

module.exports = {
  addCollectionFromModel,
  addTaxonomyCollection,
  addCollectionByTaxonomy,
  addMultilingualCollection,
  addMultilingualCollectionByTaxonomy,
  addCollectionFromFileList,
  addNavigationMenuByLang
}
