const
deepmerge = require('deepmerge'),
languages = require('languages')

function getCookieConsentConfig(customConfig = {}) {
  const baseConfig = {
    guiOptions: {
      consentModal: {
        layout: 'bar',
        position: 'bottom',
        equalWeightButtons: true,
        flipButtons: false
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: false
      }
    },
    categories: {
      necessary: {
        enabled: true,
        readOnly: true
      },
      analytics: {}
    },
    language: {
      default: 'en',
      autoDetect: 'document',
      translations: {
        en: languages.en.cookieConsent,
        it: languages.it.cookieConsent
      }
    }
  }

  return deepmerge(baseConfig, customConfig)
}

module.exports = getCookieConsentConfig
