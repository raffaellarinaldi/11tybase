const
path = require('path'),
fetch = require('node-fetch'),
languages = require('./languages')

module.exports = (eleventyConfig) => {
  eleventyConfig.addShortcode('date', () => new Date().toISOString().slice(0, 10))
  eleventyConfig.addShortcode('year', () => new Date().getFullYear())
  eleventyConfig.addShortcode('iframe', function(service, id, params = '', lang, autoscale = true) {
    const effectiveLang = lang || this.ctx?.environments?.lang || this.ctx?.lang || 'en'
    const attrs = [
      `data-service="${service}"`,
      `data-id="${id}"`,
      `data-params="${params}"`,
      `data-lang="${effectiveLang}"`,
      autoscale === true || autoscale === 'true' ? 'data-autoscale' : null
    ].filter(Boolean).join(' ')
    return `<div ${attrs}></div>`
  })
  eleventyConfig.addShortcode('iubendaScripts', function () {
    return `<script type="text/javascript">(function(w,d){var loader=function(){var s=d.createElement("script"),tag=d.getElementsByTagName("script")[0];s.src="https://cdn.iubenda.com/iubenda.js";tag.parentNode.insertBefore(s,tag)};if(w.addEventListener){w.addEventListener("load",loader,false)}else if(w.attachEvent){w.attachEvent("onload",loader)}else{w.onload=loader}})(window,document)</script>`
  })
  eleventyConfig.addShortcode('iubendaModal', function (id, type = 'privacy', style = 'nostyle', label = '', lang) {
    const effectiveLang = lang || this.ctx?.environments?.lang || this.ctx?.lang || 'en'
    const href = `https://www.iubenda.com/privacy-policy/${id}${type === 'cookie' ? '/cookie-policy' : ''}`
    const cssClass = `iubenda-${style} no-brand iubenda-noiframe iubenda-embed iubenda-noiframe`
    const defaultLabels = {
      cookie: languages[effectiveLang]?.policies?.cookie.title || 'Cookie Policy',
      privacy: languages[effectiveLang]?.policies?.privacy.title || 'Privacy Policy'
    }
    const linkLabel = label || (type === 'cookie' ? defaultLabels.cookie : defaultLabels.privacy)
    return `<a href="${href}" class="${cssClass}" title="${linkLabel}">${linkLabel}</a>`
  })
  eleventyConfig.addShortcode('iubendaEmbed', function(id, label = 'Privacy Policy') {
    return `<a href="https://www.iubenda.com/privacy-policy/${id}" class="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed iub-no-markup iubenda-noiframe iub-body-embed" title="${label}">${label}</a>`
  })
  eleventyConfig.addShortcode('copyright', function(startYear, lang = 'en', rightsReserved, name) {
    const currentYear = new Date().getFullYear()
    const effectiveLang = lang || 'en'
    const yearText = (startYear && Number(startYear) < currentYear)
      ? `${startYear} - ${currentYear}`
      : `${currentYear}`
    let rightsText = ''
    if (rightsReserved === 'all' || rightsReserved === 'some') {
      rightsText = languages[effectiveLang]?.footer.rights?.[rightsReserved] || ''
    }
    return `Copyright © ${yearText} ${name}${rightsText ? '. ' + rightsText + '.' : ''}`
  })
  eleventyConfig.addShortcode('cookieConsent', function (type = 'preferences', lang = 'en', className = '') {
    const effectiveLang = lang || this.ctx?.environments?.lang || this.ctx?.lang || 'en'
    const modalType = ['preferences', 'consent'].includes(type) ? type : 'preferences'
    const labelTitle = languages[effectiveLang]?.footer?.consent || 'Manage Consent'
    return `<a href="#" title="${labelTitle}"${className ? ` class="${className}"` : ''} data-cc="show-${modalType}Modal">${labelTitle}</a>`
  })
  eleventyConfig.addShortcode('createdBy', function (lang = 'en', className = '', extraLinks = [], domain = 'com') {
    const effectiveLang = lang || this.ctx?.environments?.lang || this.ctx?.lang || 'en'
    const baseText = languages[effectiveLang]?.footer?.createdBy || 'Created by'
    const commonAttrs = `target="_blank" rel="nofollow noreferrer noopener"${className ? ` class="${className}"` : ''}`
    const mainLink = `<a href="https://raffaellarinaldi.${domain}" ${commonAttrs}>Raffaella Rinaldi</a>`
    const links = [mainLink].concat(
      Array.isArray(extraLinks)
        ? extraLinks.map(site => `<a href="${site.url}" ${commonAttrs}>${site.name}</a>`)
        : []
    )
    const formattedLinks = links.length > 2
      ? `${links.slice(0, -1).join(', ')} & ${links.at(-1)}`
      : links.join(' & ')
    return `${baseText}: ${formattedLinks}`
  })
  eleventyConfig.addShortcode('consentButtons', (lang = 'en', buttons = []) => {
    const effectiveLang = lang || this.ctx?.environments?.lang || this.ctx?.lang || 'en'
    const labels = languages[effectiveLang]?.policies?.privacy?.buttons || {
      accept: 'Accept',
      reject: 'Reject',
      preferences: 'Preferences'
    }
    return buttons.map(btn => {
      const action = btn.action
      const tag = btn.tag || 'button'
      const className = btn.className || ''
      let extra = btn.extra || ''
      const inner = btn.inner || ''
      if(tag === 'a' && !/href\s*=/.test(extra)) {
        extra = `href="#" ${extra}`.trim()
      }
      const dataCc = {
        accept: 'accept-all',
        reject: 'accept-necessary',
        preferences: 'show-preferencesModal'
      }[action] || ''
      const label = labels[action] || action
      const content = inner ? inner.replace(/__LABEL__/g, label) : label
      return `<${tag} class="${className}" data-cc="${dataCc}" title="${label}" ${extra}>${content}</${tag}>`
    }).join('\n')
  })
}
