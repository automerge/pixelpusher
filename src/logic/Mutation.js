import Automerge from 'automerge'
import * as Init from './Init'

export const setPixel = (frameIndex, pixelIndex, color) =>
  change(pro => {
    pro.frames[frameIndex].pixels[pixelIndex] = color
  })

export const addFrame = () =>
  change(pro => {
    pro.frames.push(Init.frame(pro.columns * pro.rows))
    resetFrameIntervals(pro.frames)
  })

const resetFrameIntervals = frames => {
  const equalPercentage = 100 / frames.length;

  frames.forEach((frame, index) => {
    const percentage = index ===
      frames.length - 1 ? 100 : Math.round(((index + 1) * equalPercentage) * 10) / 10;

    frame.interval = percentage;
  });
}

const change = f => doc =>
  Automerge.change(doc, f)
