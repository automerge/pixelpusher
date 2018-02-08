import Automerge from 'automerge'
import * as Init from './Init'

export const setPixel = (frameIndex, pixelIndex, paletteId) =>
  change('Set pixel', pro => {
    pro.frames[frameIndex].pixels[pixelIndex] = paletteId
  })

export const addFrame = () =>
  change('Add frame', pro => {
    pro.frames.push(Init.emptyFrame(pro.columns * pro.rows))
    resetFrameIntervals(pro.frames)
  })

export const resize = (dimension, behavior) =>
  change('Resize', pro => {
    const delta = behavior === 'add' ? 1 : -1
    const columns = pro.columns

    pro[dimension] += delta

    pro.frames.forEach(frame => {
      frame.pixels = resizePixels(frame.pixels, dimension, behavior, columns)
    })
  })

export const deleteFrame = (frameIndex, activeFrameIndex) =>
  change('Delete frame', pro => {
    pro.frames.splice(frameIndex, 1)
    resetFrameIntervals(pro.frames)
  })

export const resetFrame = frameIndex =>
  change('Reset frame', pro => {
    pro.frames[frameIndex].pixels.fill(null)
  })

export const setFrameInterval = (frameIndex, interval) =>
  change('Set frame interval', pro => {
    pro.frames[frameIndex].interval = interval
  })

export const cloneFrame = frameIndex =>
  change('Clone frame', pro => {
    const originalFrame = pro.frames[frameIndex]
    const frame = Init.emptyFrame(pro.columns * pro.rows)
    frame.pixels = originalFrame.pixels.map(x => x)
    pro.frames.splice(frameIndex, 0, frame)
    resetFrameIntervals(pro.frames)
  })

export const setCellSize = cellSize =>
  change('Set cell size', pro => {
    pro.cellSize = cellSize
  })

export const setSwatchColor = (index, color) =>
  change('Set swatch Color', pro => {
    pro.palette[index].color = color
  })

export const addColorToPalette = color =>
  change('Add color to palette', pro => {
    pro.palette.push({color})
  })

export const setTitle = title =>
  change('Set title', pro => {
    pro.title = title
  })

export const addFrameFromPixels = (pixels, width, height) =>
  change(pro => {
    const frame = Init.frame({interval: 0})

    pro.columns = width
    pro.rows = height

    frame.pixels = pixels.map(color => {
      if (color == null) return null

      const i = pro.palette.findIndex(swatch => swatch.color === color)
      if (i >= 0) {
        return i
      } else {
        pro.palette.push({color})
        return pro.palette.length - 1
      }
    })
    pro.frames.push(frame)
    resetFrameIntervals(pro.frames)
  })

export const setAvatarId = id =>
  change(ident => {
    ident.avatarId = id
  })

export const setName = name =>
  change(ident => {
    ident.name = name
  })

const resizePixels = (pixels, dimension, behavior, columns) => {
  if (dimension === 'columns') {
    if (behavior === 'add') {
      const size = pixels.length

      for (let i = size; i > 0; i -= columns) {
        pixels.splice(i, 0, null)
      }

      return pixels
    } else {
      const size = pixels.length - 1

      for (let i = size; i > 0; i -= columns) {
        pixels.splice(i, 1)
      }

      return pixels
    }
  } else if (dimension === 'rows') {
    if (behavior === 'add') {
      pixels.push(...Init.pixels(columns))
      return pixels
    } else {
      pixels.splice(-1, columns)
      return pixels
    }
  }
}

const resetFrameIntervals = frames => {
  const equalPercentage = 100 / frames.length

  frames.forEach((frame, index) => {
    const percentage = index ===
      frames.length - 1 ? 100 : Math.round(((index + 1) * equalPercentage) * 10) / 10

    frame.interval = percentage
  })
}

const change = (message = null, f) => project =>
  project.update('doc', doc => Automerge.change(doc, message, f))
