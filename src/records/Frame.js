import shortid from 'shortid'
import {Record, List, Repeat} from 'immutable'
import {pixels} from './Pixel'

const Frame = Record({
  id: null, // required
  pixels: Repeat(null, 400).toList(),
  interval: 0, // 0 - 100
}, "Frame")

export default Frame

export const frame = () =>
  Frame({
    id: shortid.generate(),
  })

export const frameOfSize = (rows, columns) =>
  Frame({
    id: shortid.generate(),
    pixels: pixels(rows * columns, null),
  })
