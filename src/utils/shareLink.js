import Base58 from 'bs58'
import {crc16} from 'js-crc'

export const shareLinkForProjectId = id =>
  withCrc("pxlpshr://" + encode(id))

export const shareLinkForProject = project =>
  shareLinkForProjectId(project._actorId)

export const keyFromShareLink = link => {
  const {key} = parts(link)

  return key
}

export const isValidShareLink = str => {
  const {nonCrc, crc} = parts(str)
  return Boolean(nonCrc) && Boolean(crc) && crc16(nonCrc) === crc
}

export const parts = str => {
  const p = encodedParts(str)

  return {
    key: p.key && decode(p.key),
    nonCrc: p.nonCrc,
    crc: p.crc && decode(p.crc),
  }
}

export const encodedParts = str => {
  const [m, nonCrc, key, crc] = str.match(/^(pxlpshr:\/\/(\w+))\/(\w{1,4})$/) || []
  return {nonCrc, key, crc}
}

  export const withCrc = str =>
  str + `/` + encode(crc16(str))

export const encode = str =>
  Base58.encode(hexToBuffer(str))

export const decode = str =>
  bufferToHex(Base58.decode(str))

export const hexToBuffer = key =>
  Buffer.isBuffer(key)
  ? key
  : Buffer(key, 'hex')

export const bufferToHex = key =>
  Buffer.isBuffer(key)
  ? key.toString('hex')
  : key
