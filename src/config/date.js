const
dayjs = require('dayjs'),
dayjsLocaleIt = require('dayjs/locale/it'),
dayjsLocaleEn = require('dayjs/locale/en')

module.exports = (eleventyConfig, options = {}) => {
    eleventyConfig.addShortcode('date', () => `${new Date().toISOString().slice(0, 10)}`)
    eleventyConfig.addNunjucksShortcode('year', () => `${new Date().getFullYear()}`)
    const { defaultLocale = 'en', defaultFormat = 'MMM D YYYY' } = options
    dayjs.locale({
        it: dayjsLocaleIt,
        en: dayjsLocaleEn
    })
    eleventyConfig.addNunjucksFilter('date', (date, format = defaultFormat, locale = defaultLocale) => {
        return dayjs(date).locale(locale).format(format)
    })
}
