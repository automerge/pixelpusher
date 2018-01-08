import shortid from 'shortid'
import {Record, List} from 'immutable'
import {frame} from './Frame'
import {palette} from './Palette'
import { DEFAULT_COLOR } from './Pixel';

const Project = Record({
  id: null, // required
  rows: 20,
  columns: 20,
  cellSize: 10,
  frames: List.of(frame()),
  palette: palette(),
  defaultColor: DEFAULT_COLOR,
}, "Project")

export default Project

export const project = () =>
  Project({
    id: shortid.generate(),
  })
