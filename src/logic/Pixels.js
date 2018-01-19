import getPixelData from 'get-image-pixels'

export const getPixels = img => {
  const pixels = []
  const data = getPixelData(img)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]

    if (a !== 0) {
      pixels.push(hex(r, g, b))
    } else {
      pixels.push(null)
    }
  }

  return pixels
}

const hex = (...xs) =>
  "#" + xs.map(x => x.toString(16)).join('')
