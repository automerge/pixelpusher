import {fromJS, Map} from 'immutable'
import Automerge from 'automerge'

import State from '../records/State'
import Project from '../records/Project'
import Palette from '../records/Palette'
import Frame from '../records/Frame'
import PeerInfo from '../records/PeerInfo';

export const serializeState = state =>
  ({
    peerInfo: state.peerInfo.toJS(),
    // projects: state.projects.map(Automerge.save),
    currentProjectId: state.currentProjectId,
    focusedProjectId: state.focusedProjectId,
  })

export const deserializeState = json =>
  State({
    peerInfo: deserializePeerInfo(json.peerInfo),
    // projects: deserializeProjects(json.projects),
    currentProjectId: json.currentProjectId,
    focusedProjectId: json.focusedProjectId,
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

export const deserializePeerInfo = json =>
  PeerInfo(json && {
    name: json.name,
    avatarKey: json.avatarKey,
  })

export const deserializePalette = json =>
  fromJS(json)
