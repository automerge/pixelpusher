import {Map} from 'immutable'
import State from '../records/State'

export const serializeState = state =>
  ({
    currentProjectId: state.currentProjectId,
    identityId: state.identityId,
    cloudPeers: state.cloudPeers.toJS()
  })

export const deserializeState = json =>
  State({
    currentProjectId: json.currentProjectId,
    identityId: json.identityId,
    cloudPeers: json.cloudPeers ? new Map(json.cloudPeers) : new Map()
  })
