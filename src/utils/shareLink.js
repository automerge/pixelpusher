import Emoji from 'base-emoji'

export const shareLinkForProjectId = id =>
  "pxlpshr://" + keyToEmoji(id)

export const shareLinkForProject = project =>
  shareLinkForProjectId(project.get('id'))

export const keyFromShareLink = link => {
  const emojiKey = link.slice(10)

  return keyHex(Emoji.fromUnicode(emojiKey))
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
