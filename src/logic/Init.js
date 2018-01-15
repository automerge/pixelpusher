import shortid from 'shortid'
import Automerge from 'automerge'
import { DEFAULT_COLOR } from "../records/Project";

const init = f => doc =>
  Automerge.change(doc, f)

export const project = init(pro => {
  pro.id = pro._actorId
  pro.rows = 16
  pro.columns = 16
  pro.cellSize = 10
  pro.defaultColor = DEFAULT_COLOR
  pro.frames = [emptyFrame(16 * 16)]
  pro.palette = palette()
})

export const frame = frame => {
  frame.id = shortid.generate()
  return frame
}

export const emptyFrame = n =>
  frame({
    pixels: pixels(n),
    interval: 0,
  })

export const pixels = n =>
  Array(n).fill(null)

const palette = () =>
  [ { color: '#000000' },
    { color: '#ff0000' },
    { color: '#e91e63' },
    { color: '#9c27b0' },
    { color: '#673ab7' },
    { color: '#3f51b5' },
    { color: '#2196f3' },
    { color: '#03a9f4' },
    { color: '#00bcd4' },
    { color: '#009688' },
    { color: '#4caf50' },
    { color: '#8bc34a' },
    { color: '#cddc39' },
    { color: '#9ee07a' },
    { color: '#ffeb3b' },
    { color: '#ffc107' },
    { color: '#ff9800' },
    { color: '#ffcdd2' },
    { color: '#ff5722' },
    { color: '#795548' },
    { color: '#9e9e9e' },
    { color: '#607d8b' },
    { color: '#303f46' },
    { color: '#ffffff' },
    { color: '#383535' },
    { color: '#383534' },
    { color: '#383533' },
    { color: '#383532' },
    { color: '#383531' },
    { color: '#383530' },
  ]
