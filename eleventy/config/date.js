const
dayjs = require('dayjs'),
localizedFormat = require('dayjs/plugin/localizedFormat'),
languages = require('./languages')

dayjs.extend(localizedFormat)

const supportedLanguages = Object.keys(languages).reduce((acc, lang) => {
    try {
        acc[lang] = require(`dayjs/locale/${lang}`)
    } catch {
        console.warn(`[WARNING] Locale "${lang}" not found in Day.js.`)
    }
    return acc
}, {})

module.exports = (eleventyConfig, options = {}) => {
    const { defaultLocale = 'en', defaultFormat = 'MMM D YYYY' } = options

    eleventyConfig.addNunjucksFilter('date', function(date, format, locale, pageLang) {
        const ctx = this?.ctx || {}
        const lang = locale || pageLang || ctx.lang || defaultLocale
        const dateFormat = format || ctx.defaultDateFormat || defaultFormat

        if (!supportedLanguages[lang]) {
            console.warn(`[WARNING] Unsupported lang "${lang}". Falling back to "${defaultLocale}".`)
            return dayjs(date).locale(defaultLocale).format(dateFormat)
        }

        return dayjs(date).locale(lang).format(dateFormat)
    })
}
