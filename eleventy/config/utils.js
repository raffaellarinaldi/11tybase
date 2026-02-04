function deIndent(str) {
  const lines = str.split('\n')
  const firstLine = lines.find(line => line.trim() !== '') || ''
  const indentation = firstLine.match(/^(\s*)/) ? firstLine.match(/^(\s*)/)[0].length : 0
  return lines.map(line => line.slice(indentation)).join('\n').trim()
}

function removeParagraphsFromMarkdown(content) {
  return content.replace(/<p>(.*?)<\/p>/g, '$1')
}

function sortCollection(collection, field = 'date', order = 'desc') {
  if (field === 'title' && (order === undefined || order === null)) {
    order = 'asc'
  }

  return collection.every(item => item.data?.[field] !== undefined)
    ? collection.sort((a, b) => {
        let aValue = field === 'date' ? new Date(a.data.date) : (a.data[field] ?? '').toString().toLowerCase()
        let bValue = field === 'date' ? new Date(b.data.date) : (b.data[field] ?? '').toString().toLowerCase()

        if (order === 'asc') {
          return aValue > bValue ? 1 : -1
        } else if (order === 'desc') {
          return aValue < bValue ? 1 : -1
        }

        return 0
      })
    : collection
}

module.exports = {
  deIndent,
  removeParagraphsFromMarkdown,
  sortCollection
}
