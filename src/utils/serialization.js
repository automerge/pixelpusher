import {fromJS, Map} from 'immutable'
import Automerge from 'automerge'

import State from '../records/State'
import Project from '../records/Project'
import Palette from '../records/Palette'
import Frame from '../records/Frame'

export const serializeState = state =>
  ({
    // projects: state.projects.map(Automerge.save),
    // currentProjectId: state.currentProjectId,
  })

export const deserializeState = json =>
  State({
    // projects: deserializeProjects(json.projects),
    // currentProjectId: json.currentProjectId,
  })

export const deserializeProjects = json =>
  Map(json).map(deserializeProject)

export const deserializeProject = (json, actorId) =>
  Automerge.loadImmutable(json, actorId)


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
