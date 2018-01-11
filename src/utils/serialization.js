import {fromJS, Map} from 'immutable'
import State from '../records/State'
import Project from '../records/Project'
import Palette from '../records/Palette'
import Frame from '../records/Frame'

export const serializeState = state =>
  ({
    projects: state.projects.toJS(),
    currentProjectId: state.currentProjectId,
  })

export const deserializeState = json =>
  State({
    projects: deserializeProjects(json.projects),
    currentProjectId: json.currentProjectId,
  })

export const deserializeProjects = json =>
  Map(json).map(deserializeProject)

export const deserializeProject = json =>
  Project({
    id: json.id,
    rows: json.rows,
    columns: json.columns,
    cellSize: json.cellSize,
    frames: deserializeFrames(json.frames),
    palette: deserializePalette(json.palette),
    defaultColor: json.defaultColor,
  })

export const deserializeFrames = json =>
  fromJS(json.map(deserializeFrame))

export const deserializeFrame = json =>
  Frame({
    id: json.id,
    pixels: fromJS(json.pixels),
    interval: json.interval,
  })

export const deserializePalette = json =>
  fromJS(json)
