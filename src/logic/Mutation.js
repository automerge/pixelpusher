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

export const resize = (dimension, behavior) =>
  change(pro => {
    const delta = behavior === 'add' ? 1 : -1
    const columns = pro.columns

    pro[dimension] += delta

    pro.frames.forEach(frame => {
      frame.pixels = resizePixels(frame.pixels, dimension, behavior, columns)
    })
  })

export const deleteFrame = (frameIndex, activeFrameIndex) =>
  change(pro => {
    pro.frames.splice(frameIndex, 1)
    resetFrameIntervals(pro.frames)
  })

export const resetFrame = frameIndex =>
  change(pro => {
    pro.frames[frameIndex].pixels.fill(null)
  })

export const setFrameInterval = (frameIndex, interval) =>
  change(pro => {
    pro.frames[frameIndex].interval = interval
  })

const resizePixels = (pixels, dimension, behavior, columns) => {
    if (dimension === 'columns') {
      if (behavior === 'add') {
        const size = pixels.length;

        for (let i = size; i > 0; i -= columns) {
          pixels.splice(i, 0, null);
        }

        return pixels
      } else {
        return pixels.filter((_, i) => (i + 1) % columns !== 0)
      }
    } else if (dimension === 'rows') {
      if (behavior === 'add') {
        return pixels.concat(Init.pixels(columns))
      } else {
        return pixels.slice(0, -columns)
      }
    }
  }

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
