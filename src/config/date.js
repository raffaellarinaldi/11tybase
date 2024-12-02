const
dayjs = require('dayjs'),
localizedFormat = require('dayjs/plugin/localizedFormat'),
dayjsLocaleIt = require('dayjs/locale/it'),
dayjsLocaleEn = require('dayjs/locale/en')

dayjs.extend(localizedFormat)

module.exports = (eleventyConfig, options = {}) => {
    const {
        defaultLocale = 'en',
        defaultFormat = 'MMM D YYYY',
        isMultilingual = false,
        languages = {}
    } = options

    const supportedLanguages = { en: dayjsLocaleEn, it: dayjsLocaleIt }

    eleventyConfig.addNunjucksFilter('date', (date, format, locale, pageLang) => {
        let lang = locale || pageLang || defaultLocale
        let dateFormat = format

        if (isMultilingual && !format && languages[lang]) dateFormat = languages[lang].defaultDateFormat
        if (!dateFormat) dateFormat = defaultFormat
        if (!supportedLanguages[lang]) {
            console.warn(`[WARNING] Unsupported lang "${lang}". Falling back to "${defaultLocale}".`)
            lang = defaultLocale
        }

        dayjs.locale(lang)
        return dayjs(date).format(dateFormat)
    })

    eleventyConfig.addShortcode('date', () => new Date().toISOString().slice(0, 10))
    eleventyConfig.addShortcode('year', () => new Date().getFullYear())
}
