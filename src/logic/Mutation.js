import Automerge from 'automerge'

export const setPixel = (frameIndex, pixelIndex, color) =>
  change(pro => {
    pro.frames[frameIndex].pixels[pixelIndex] = color
  })

const change = f => doc =>
  Automerge.change(doc, f)
