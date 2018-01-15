import Base58 from 'bs58'

export const shareLinkForProjectId = id =>
  "pxlpshr://" + encodeKey(id)

export const shareLinkForProject = project =>
  shareLinkForProjectId(project.get('id'))

export const keyFromShareLink = link => {
  const encodedKey = link.slice(10)

  return keyHex(Base58.decode(encodedKey))
}

export const encodeKey = key =>
  Base58.encode(keyBuffer(key))

export const keyBuffer = key =>
  Buffer.isBuffer(key)
  ? key
  : Buffer(key, 'hex')

export const keyHex = key =>
  Buffer.isBuffer(key)
  ? key.toString('hex')
  : key
