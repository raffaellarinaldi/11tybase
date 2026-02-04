const
deepmerge = require('deepmerge'),
languages = require('languages')

const defaultIframeConfig = {
  currLang: null,
  services: {
    youtube: {
      embedUrl: 'https://www.youtube-nocookie.com/embed/{data-id}?rel=0',
      thumbnailUrl: async (dataId, setThumbnail) => {
        const maxres = `https://i3.ytimg.com/vi/${dataId}/maxresdefault.jpg`
        const fallback = `https://i3.ytimg.com/vi/${dataId}/hqdefault.jpg`
        try {
          const res = await fetch(maxres, { method: 'HEAD' })
          const exists = res.ok && res.headers.get('Content-Type')?.startsWith('image')
          setThumbnail(exists ? maxres : fallback)
        } catch (err) {
          setThumbnail(fallback)
        }
      },
      iframe: {
        allow: 'autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen'
      },
      languages: {
        en: languages.en.iframeManager.youtube,
        it: languages.it.iframeManager.youtube
      }
    },
    vimeo: {
      embedUrl: 'https://player.vimeo.com/video/{data-id}',
      iframe: {
        allow: 'fullscreen; picture-in-picture, allowfullscreen'
      },
      thumbnailUrl: async (dataId, setThumbnail) => {
        const url = `https://vimeo.com/api/v2/video/${dataId}.json`
        const response = await (await fetch(url)).json()
        if (response[0]?.thumbnail_large) setThumbnail(response[0].thumbnail_large)
      },
      languages: {
        en: languages.en.iframeManager.vimeo,
        it: languages.it.iframeManager.vimeo
      }
    },
    googleMaps: {
      embedUrl: 'https://www.google.com/maps/embed?pb={data-id}',
      iframe: {
        allow: 'picture-in-picture; fullscreen'
      },
      languages: {
        en: languages.en.iframeManager.googleMaps,
        it: languages.it.iframeManager.googleMaps
      }
    }
  }
}

function acceptChangedServices(changedServices) {
  const userPrefs = CookieConsent.getUserPreferences().acceptedServices || {}
  for (const service of changedServices) {
    for (const [category, services] of Object.entries(userPrefs)) {
      if (services.includes(service)) {
        const updated = [...new Set([...services, service])]
        CookieConsent.acceptService(updated, category)
        break
      }
    }
  }
}

function runIframeManager(userConfig = {}) {
  let detectedLang = 'en'
  if (typeof window !== 'undefined') {
    const container = document.querySelector('[data-service][data-lang]')
    detectedLang = container?.dataset.lang || detectedLang
  }
  const config = deepmerge(defaultIframeConfig, userConfig)
  config.currLang = config.currLang || detectedLang
  const im = iframemanager()
  im.run({
    ...config,
    onChange: ({ changedServices, eventSource }) => {
      if (userConfig.onChange) userConfig.onChange({ changedServices, eventSource })
      if (eventSource.type === 'click') acceptChangedServices(changedServices)
    }
  })
  return im
}

module.exports = {
  runIframeManager
}
