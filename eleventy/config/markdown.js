const
markdownIt = require('markdown-it'),
markdownItAttrs = require('markdown-it-attrs'),
markdownItFootnote = require('markdown-it-footnote')

module.exports = (options) => {
  const {
    tagClassMapByContext = {},
    wrapperConfigByContext = {},
    getContext = () => 'default'
  } = options

  const md = markdownIt({ html: true })
    .use(markdownItAttrs)
    .use(markdownItFootnote)

  md.use(md => {
    const defaultLinkRender = md.renderer.rules.link_open || ((tokens, idx, opts, env, self) => self.renderToken(tokens, idx, opts))

    md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
      const token = tokens[idx]
      const href = token.attrGet('href')
      const context = getContext(env)
      const tagClassMap = tagClassMapByContext[context] || {}

      if (href && /^https?:\/\//.test(href)) {
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noopener noreferrer')
      } else {
        token.attrSet('target', '_self')
      }

      if (tagClassMap['a']) token.attrJoin('class', tagClassMap['a'])
      return defaultLinkRender(tokens, idx, opts, env, self)
    }

    md.renderer.rules.image = (tokens, idx, opts, env, self) => {
      const token = tokens[idx]
      const alt = token.content || token.attrGet('alt') || ''
      const context = getContext(env)
      const tagClassMap = tagClassMapByContext[context] || {}

      token.attrSet('alt', alt)
      if (tagClassMap['img']) token.attrJoin('class', tagClassMap['img'])
      return self.renderToken(tokens, idx, opts)
    }

    md.core.ruler.push('apply_custom_classes_and_wrappers', state => {
      const env = state.env
      const context = getContext(env)
      const tagClassMap = tagClassMapByContext[context] || {}
      const wrapperConfig = wrapperConfigByContext[context] || null

      const tokens = state.tokens
      const newTokens = []
      let wrapping = false

      tokens.forEach(token => {
        const tag = token.tag

        if (
          (token.type.endsWith('_open') || token.type === 'hr') &&
          tag &&
          tagClassMap[tag]
        ) {
          token.attrJoin('class', tagClassMap[tag])
        }

        if (
          wrapperConfig &&
          token.type === 'heading_open' &&
          wrapperConfig.triggers.includes(tag)
        ) {
          if (wrapping) {
            const close = new state.Token('html_block', '', 0)
            close.content = `</${wrapperConfig.tag}>`
            newTokens.push(close)
          }

          const open = new state.Token('html_block', '', 0)
          open.content = `<${wrapperConfig.tag} class="${wrapperConfig.class}">`
          newTokens.push(open)
          wrapping = true
        }

        newTokens.push(token)
      })

      if (wrapping && wrapperConfig) {
        const close = new state.Token('html_block', '', 0)
        close.content = `</${wrapperConfig.tag}>`
        newTokens.push(close)
      }

      state.tokens = newTokens
    })
  })

  return md
}
