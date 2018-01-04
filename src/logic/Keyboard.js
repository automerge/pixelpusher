export const shortcut = e => {
  let key = ''

  if (e.altKey) key += 'Alt+'
  if (e.ctrlKey) key += 'Ctrl+'
  if (e.metaKey) key += 'Meta+'

  key += e.key

  return key
}

