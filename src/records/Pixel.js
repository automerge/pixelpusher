import {Record, Repeat} from 'immutable'

export const DEFAULT_COLOR = '#313131';

const Pixel = Record({
  color: DEFAULT_COLOR,
  used: false,
}, "Pixel")

export default Pixel

export const pixel = (color = DEFAULT_COLOR) =>
  Pixel({
    color,
    used: true,
  })

export const emptyPixel = (color = DEFAULT_COLOR) =>
  Pixel({
    color,
    used: false,
  })

export const pixels = (n, color = DEFAULT_COLOR) =>
  Repeat(pixel(color), n).toList()

export const emptyPixels = (n, color = DEFAULT_COLOR) =>
  Repeat(emptyPixel(color), n).toList()
