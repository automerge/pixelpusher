import shortid from 'shortid'
import Automerge from 'automerge'
import { DEFAULT_COLOR } from "../records/Project";

const init = f => doc =>
  Automerge.change(doc, f)

export const project = init(pro => {
  pro.id = pro._actorId
  pro.rows = 20
  pro.columns = 20
  pro.cellSize = 10
  pro.defaultColor = DEFAULT_COLOR
  pro.frames = [frame(20 * 20)]
  pro.palette = palette()
})

const frame = n => ({
  id: shortid.generate(),
  pixels: pixels(n),
  interval: 0,
})

const pixels = n =>
  Array(n).fill(null)

const palette = () =>
  [ { color: '#000000', id: 0 },
    { color: '#ff0000', id: 1 },
    { color: '#e91e63', id: 2 },
    { color: '#9c27b0', id: 3 },
    { color: '#673ab7', id: 4 },
    { color: '#3f51b5', id: 5 },
    { color: '#2196f3', id: 6 },
    { color: '#03a9f4', id: 7 },
    { color: '#00bcd4', id: 8 },
    { color: '#009688', id: 9 },
    { color: '#4caf50', id: 10 },
    { color: '#8bc34a', id: 11 },
    { color: '#cddc39', id: 12 },
    { color: '#9ee07a', id: 13 },
    { color: '#ffeb3b', id: 14 },
    { color: '#ffc107', id: 15 },
    { color: '#ff9800', id: 16 },
    { color: '#ffcdd2', id: 17 },
    { color: '#ff5722', id: 18 },
    { color: '#795548', id: 19 },
    { color: '#9e9e9e', id: 20 },
    { color: '#607d8b', id: 21 },
    { color: '#303f46', id: 22 },
    { color: '#ffffff', id: 23 },
    { color: '#383535', id: 24 },
    { color: '#383534', id: 25 },
    { color: '#383533', id: 26 },
    { color: '#383532', id: 27 },
    { color: '#383531', id: 28 },
    { color: '#383530', id: 29 },
  ]
