import Emoji from 'base-emoji'

export const shareLinkForProject = project =>
  "pxlpshr://" + project.get('id') + "/" + keyToEmoji(project.get('key'))

export const keyFromShareLink = link => {
  const [id, emojiKey] = link.slice(10).split('/')

  return [id, keyHex(Emoji.fromUnicode(emojiKey))]
}

export const keyToEmoji = key =>
  Emoji.toUnicode(keyBuffer(key))

export const keyBuffer = key =>
  Buffer.isBuffer(key)
  ? key
  : Buffer(key, 'hex')

export const keyHex = key =>
  Buffer.isBuffer(key)
  ? key.toString('hex')
  : key
